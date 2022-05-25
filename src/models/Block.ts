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
        await executeTransaction(tx, previousStateHash, index)
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

    return { transactionsBash, blockchain }
  }

  validate = async (
    previousStateHash: AddressReference,
    privateKey: AddressReference,
    bond: Bond
  ): Promise<void> => {
    let state: any = await BackendAdapter.instance
      .useState(previousStateHash)
      .all()

    const validator: Account = Account.instantiate(
      state.accounts[hash(privateKey)]
    )

    const { transactionsBash, blockchain } = await this.executeBlock(
      state,
      validator
    )

    // Saving the transactions
    transactionsBash.map((tx) => {
      BackendAdapter.instance
        .useState(this.hash)
        .create('transactions', tx.hash, tx)
    })

    const bonds = await BackendAdapter.instance.useWorldState().list('bonds')

    // Saving bonds state
    await Promise.all(
      bonds.map(async (bond: Bond) => {
        await BackendAdapter.instance
          .useState(this.hash)
          .create('transactions', bond.hash, bond)
      })
    )

    this.transactions = transactionsBash

    // Validator's fields
    this.validatedBy = validator.address
    this.signature = (await signMessage(privateKey, this.hash)).signature

    // Saving block
    await BackendAdapter.instance
      .useWorldState()
      .create('blocks', this.hash, this)

    // Updating chain's metadata
    BackendAdapter.instance
      .useWorldState()
      .update('blockchain', 'blockchain', blockchain)

    return
  }

  confirm = async (previousStateHash: AddressReference) => {
    const validator = await BackendAdapter.instance
      .useState(previousStateHash)
      .read('accounts', this.validatedBy)

    if (
      !this.signature ||
      !this.recovery ||
      !verifySignature(this.signature, this.hash, this.recovery)
    ) {
      this.status = 'refused'
      this.reason = "Signature doesn't correspond to validator."
      return
    }

    await this.executeBlock(previousStateHash, validator)
  }
}
