import sha256 from 'fast-sha256'
import util from 'tweetnacl-util'
import BackendAdapter from '../adapters/BackendAdapter'
import { calculateFees, signMessage, verifySignature } from '../common'
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
  volume: number
  fees: number
  signature?: AddressReference
  recovery?: number

  constructor(data: BlockType) {
    super(data)

    if (!data.fees) {
      this.fees = 0
    }

    if (!data.volume) {
      this.volume = 0
    }

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
    let transactions = await BackendAdapter.instance
      .useWorldState()
      .find('transactions', 'status', 'pending', 'asc')

    const blockchain: Blockchain = await BackendAdapter.instance
      .useWorldState()
      .read('blockchain', 'blockchain')

    // Maximum of transactions that can be put in a block cannot be above the number of accounts
    transactions = transactions.slice(0, blockchain.meta.eoaCount + 1)

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

    // Generating state hash
    if (!this.hash) {
      this.hash = hash(JSON.stringify(this.transactions))
    }

    // Resetting counters
    this.volume = 0
    this.fees = 0

    let index = 0
    for (let tx of this.transactions) {
      try {
        const transaction = Transaction.instantiate(tx)

        // We don't execute the reward here
        if (transaction.from == ('' as AddressReference)) {
          continue
        }

        // Veryfing fees
        if (transaction.fees != calculateFees(transaction.amount, 0.01)) {
          throw Error(
            'Fees not paid! Fees represent 1% of transactions and are at least 1 FLT'
          )
        }

        const internalTransactions = await executeTransaction(
          transaction,
          previousStateHash,
          index,
          false
        )

        if (internalTransactions) {
          transaction.internalTransactions = internalTransactions
        }

        transaction.status = 'done'
        transaction.order = index

        this.volume += transaction.total
        this.fees += transaction.fees

        await BackendAdapter.instance
          .useWorldState()
          .create('transactions', transaction.hash, transaction)

        transactionsBash.push(transaction._toJSON())
      } catch (e) {
        const transaction = Transaction.instantiate(tx)

        transaction.status = 'aborted'
        transaction.abortReason = (e as Error).message

        await BackendAdapter.instance
          .useWorldState()
          .create('transactions', transaction.hash, transaction)

        transactionsBash.push(transaction._toJSON())
      }

      index++
    }

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

    // Paying the reward
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

    const blockchain: Blockchain = await previousState.read(
      'blockchain',
      'blockchain'
    )

    return { transactionsBash, blockchain }
  }

  confirm = async (previousStateHash: AddressReference): Promise<boolean> => {
    const { currentBlockHash, meta } = await BackendAdapter.instance
      .useWorldState()
      .read('blockchain', 'blockchain')

    const validator = await BackendAdapter.instance
      .useWorldState()
      .read('accounts', this.validatedBy)

    if (this.parentHash != currentBlockHash) {
      this.status = 'refused'
      this.reason = 'Bad chain.'
      await BackendAdapter.instance
        .useWorldState()
        .create('blocks', this.hash, this)

      return false
    }

    // BlocksCount is blockHeight + 1
    // Here we want to check that the blockheight is correct for the new block
    if (this.blockHeight != meta.blocksCount) {
      // If the block is late, it is set to "refused"
      if (this.blockHeight > meta.blocksCount) {
        this.status = 'refused'
        this.reason = 'Late block.'
        await BackendAdapter.instance
          .useWorldState()
          .create('blocks', this.hash, this)

        return false
      }

      this.status = 'refused'
      this.reason = 'Wrong height.'
      await BackendAdapter.instance
        .useWorldState()
        .create('blocks', this.hash, this)

      return false
    }

    // Block must be signed
    if (
      !this.validatedBy ||
      !this.signature ||
      typeof this.recovery != 'number'
    ) {
      this.status = 'refused'
      this.reason = 'Not signed.'
      await BackendAdapter.instance
        .useWorldState()
        .create('blocks', this.hash, this)
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
      this.reason = `Bad signature. Got ${recoveredAddress}`
      await BackendAdapter.instance
        .useWorldState()
        .create('blocks', this.hash, this)
      return false
    }

    // If the transaction is already registered in the DB,
    // and if is not pending
    // then the block shouldn't include it.
    let index = 0
    for (let element of this.transactions) {
      if (
        (element.from as string) == '' &&
        index == this.transactions.length - 1
      ) {
        index++
        continue
      }

      const registeredTransaction = await BackendAdapter.instance
        .useWorldState()
        .read('transactions', element.hash)

      if (registeredTransaction && registeredTransaction.status != 'pending') {
        this.status = 'refused'
        this.reason = 'A transaction has already been processed.'
        await BackendAdapter.instance
          .useWorldState()
          .create('blocks', this.hash, this)
        return false
      }

      index++
    }

    try {
      const { blockchain } = await this.executeBlock(
        previousStateHash,
        validator
      )

      // Updating chain's metadata
      blockchain.currentBlockHash = this.hash
      blockchain.meta.blocksCount += 1
      blockchain.meta.averageBlockVolume =
        (blockchain.meta.averageBlockVolume + this.volume) /
        blockchain.meta.blocksCount

      await BackendAdapter.instance
        .useWorldState()
        .update('blockchain', 'blockchain', blockchain)

      this.status = 'accepted'
      await BackendAdapter.instance
        .useWorldState()
        .create('blocks', this.hash, this)

      return true
    } catch (e) {
      this.status = 'refused'
      this.reason = (e as Error).message
      await BackendAdapter.instance
        .useWorldState()
        .create('blocks', this.hash, this)

      return false
    }
  }
}
