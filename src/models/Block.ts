import sha256 from 'fast-sha256'
import util from 'tweetnacl-util'
import BackendAdapter from '../adapters/BackendAdapter'
import { signMessage, verifySignature } from '../common'
import executeTransaction from '../common/executeTransaction'
import hash from '../common/hash'
import Account from './Account'
import BaseObject from './BaseObject'
import Blockchain from './Blockchain'
import Bond from './Bond'
import { AddressReference } from './References'
import { State } from './State'
import Transaction from './Transaction'

export interface BlockType {
  timestamp: Date
  status: 'pending' | 'refused' | 'accepted'
  reason?: string
  blockHeight: number
  validatedBy: AddressReference
  hash: AddressReference
  parentHash: string
  transactions: Transaction[]
  volume?: number
  fees?: number
  signature?: AddressReference
  recovery?: number
}

export default class Block extends BaseObject implements BlockType {
  timestamp: Date
  status: 'pending' | 'refused' | 'accepted'
  reason?: string
  blockHeight: number
  validatedBy: AddressReference
  hash: AddressReference
  parentHash: string
  transactions: Transaction[]
  volume: number = 0
  fees: number = 0
  signature?: AddressReference
  recovery?: number

  constructor(data: BlockType) {
    super(data)

    if (data.timestamp) {
      this.timestamp = data.timestamp
    } else {
      this.timestamp = new Date()
    }
  }

  static instantiate = (data: BlockType) => {
    return new this(data)
  }

  static generate = async (address: AddressReference) => {
    // Validators must process oldest transactions first
    const transactions = await BackendAdapter.instance
      .useWorldState()
      .find('transactions', 'status', 'pending', 'asc')

    const blockchain: Blockchain = await BackendAdapter.instance
      .useWorldState()
      .read('blockchain', 'blockchain')

    // Maximum of transactions that can be put in a block cannot be above the number of accounts
    transactions.slice(0, blockchain.meta.eoaCount - 1)

    const timestamp = new Date()
    const parentHash = blockchain.currentBlockHash
    const blockHeight = blockchain.meta.blocksCount
    const blockHash = hash(parentHash + timestamp + blockHeight)

    return new this({
      timestamp,
      status: 'pending',
      blockHeight,
      validatedBy: address,
      parentHash,
      hash: blockHash,
      transactions,
    })
  }

  calculateHash = (): AddressReference => {
    if (!this.transactions) {
      throw 'Empty block!'
    }

    if (!this.parentHash) {
      throw 'No parent hash!'
    }

    const summedData =
      this.parentHash +
      JSON.stringify(this.transactions) +
      this.timestamp.toTimeString()

    const mixHash = hash(summedData)

    this.hash = mixHash

    return mixHash
  }

  executeBlock = async (
    previousStateHash: AddressReference,
    validator: Account
  ) => {
    const previousState = BackendAdapter.instance.useState(previousStateHash)
    let transactionsBash: Transaction[] = []
    let index = transactionsBash.length

    const blockchain = await previousState.read('blockchain', 'blockchain')

    // Generating state hash
    this.hash = hash(JSON.stringify(this.transactions))

    this.transactions.map(async (tx, index) => {
      try {
        const internalTransactions = await executeTransaction(
          tx,
          previousStateHash,
          index,
          false
        )

        if (internalTransactions) {
          tx.internalTransactions = internalTransactions
        }

        tx.status = 'done'
        tx.order = index

        this.volume += tx.total
        this.fees += tx.fees

        transactionsBash.push(tx)
      } catch (e) {
        tx.status = 'aborted'
        tx.abortReason = (e as Error).message

        transactionsBash.push(tx)
      }
    })

    // Getting validator's account once again
    // May have been modified during block execution
    const validatorAccount = await BackendAdapter.instance
      .useWorldState()
      .read('accounts', validator.address)

    // Adding the reward
    const reward = Transaction.instantiate({
      from: `` as AddressReference,
      to: validator.address,
      status: 'done',
      amount: this.fees,
      fees: 0,
      total: this.fees,
      data: '',
    })
    transactionsBash.push(reward)
    validatorAccount.balance += this.fees

    this.transactions = transactionsBash

    // Saving validator
    await BackendAdapter.instance
      .useWorldState()
      .update('accounts', validatorAccount.address, validatorAccount)

    // Saving block
    await BackendAdapter.instance
      .useWorldState()
      .create('blocks', this.hash, this)

    // Updating chain's metadata
    BackendAdapter.instance
      .useWorldState()
      .update('blockchain', 'blockchain', blockchain)

    return { transactionsBash, blockchain }
  }

  confirm = async (previousStateHash: AddressReference) => {
    const { currentBlockHash, meta } = await BackendAdapter.instance
      .useWorldState()
      .read('blockchain', 'blockchain')

    const validator = await BackendAdapter.instance
      .useState(previousStateHash)
      .read('accounts', this.validatedBy)

    if (this.parentHash != currentBlockHash) {
      this.status = 'refused'
      this.reason = 'Bad chain.'
      BackendAdapter.instance.useWorldState().update('blocks', this.hash, this)

      return false
    }

    // BlocksCount is blockHeight + 1
    // Here we want to check that the blockheight is correct for the new block
    if (this.blockHeight != meta.blocksCount + 2) {
      // If the block is late, it is set to "refused"
      if (this.blockHeight > meta.blocksCount + 2) {
        this.status = 'refused'
        this.reason = 'Late block.'
        BackendAdapter.instance
          .useWorldState()
          .update('blocks', this.hash, this)
      }

      return false
    }

    // Block must be signed
    if (!this.validatedBy || !this.signature || !this.recovery) {
      this.status = 'refused'
      this.reason = 'Not signed.'
      BackendAdapter.instance.useWorldState().update('blocks', this.hash, this)
      return false
    }

    // Checking signature
    const { address: recoveredAddress } = verifySignature(
      this.signature,
      this.hash,
      this.recovery
    )
    if (recoveredAddress != this.validatedBy) {
      this.status = 'refused'
      this.reason = 'Bad signature.'
      BackendAdapter.instance.useWorldState().update('blocks', this.hash, this)
      return false
    }

    // If the transaction is already registered in the DB,
    // and if is not pending
    // then the block shouldn't include it.
    await Promise.all(
      this.transactions.map(async (element: Transaction) => {
        const registeredTransaction = await BackendAdapter.instance
          .useWorldState()
          .read('transactions', element.hash)

        if (
          registeredTransaction &&
          registeredTransaction.status != 'pending'
        ) {
          return false
        }
      })
    )

    try {
      await this.executeBlock(previousStateHash, validator)
      return true
    } catch (e) {
      this.status = 'refused'
      this.reason = (e as Error).message
      BackendAdapter.instance.useWorldState().update('blocks', this.hash, this)
      return false
    }
  }
}
