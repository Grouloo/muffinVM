import sha256 from 'fast-sha256'
import util from 'tweetnacl-util'
import BackendAdapter from '../adapters/BackendAdapter'
import { signMessage, verifySignature } from '../common'
import executeTransaction from '../common/executeTransaction'
import hash from '../common/hash'
import Account from './Account'
import BaseObject from './BaseObject'
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
  tax: number
  hash: AddressReference
  parentHash: string
  transactions: Transaction[]
  volume?: number
  burned?: number
  signature: AddressReference
  recovery: number
  bondAddress: AddressReference
}

export default class Block extends BaseObject implements BlockType {
  timestamp: Date
  status: 'pending' | 'refused' | 'accepted'
  reason?: string
  blockHeight: number
  validatedBy: AddressReference
  tax: number
  hash: AddressReference
  parentHash: string
  transactions: Transaction[]
  volume: number = 0
  burned: number = 0
  signature: AddressReference
  recovery: number
  bondAddress: AddressReference

  constructor(data: BlockType) {
    super(data)

    if (data.timestamp) {
      this.timestamp = data.timestamp
    } else {
      this.timestamp = new Date()
    }
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
    validator: Account,
    bond: Bond
  ) => {
    const previousState = BackendAdapter.instance.useState(previousStateHash)
    let transactionsBash: Transaction[] = []
    let index = transactionsBash.length

    // The validator can add a repayment of its bond
    // at the end of the block
    const interest = Transaction.instantiate({
      order: index++,
      from: '0x0',
      to: validator.address,
      amount: bond.interest,
      gas: 0,
      total: bond.interest,
      data: '',
      status: 'done',
      signature: '0x0',
      recovery: 0,
    })
    this.transactions.push(interest)

    bond.remainingBlocks -= 1

    transactionsBash.push(interest.toJSON())

    // When all the blocks of the bond have been validated,
    // the validator is fully repayed and the bond is marked as payed
    if (bond.remainingBlocks <= 0) {
      const repayment = Transaction.instantiate({
        order: index++,
        from: '0x0',
        to: validator.address,
        amount: bond.principal,
        gas: 0,
        total: bond.principal,
        data: '',
        status: 'done',
        signature: '0x0',
        recovery: 0,
      })

      bond.status = 'payed'
      this.transactions.push(repayment)
    }

    const blockchain = await previousState.read('blockchain', 'blockchain')

    // Generating state hash
    this.hash = hash(JSON.stringify(this.transactions))

    this.transactions.map(async (tx, index) => {
      try {
        await executeTransaction(tx, previousStateHash, index)
        tx.status = 'done'
        tx.order = index

        blockchain.meta.totalSupply -= tx.gas
        this.volume += tx.total
        this.burned += tx.gas

        transactionsBash.push(tx)
      } catch (e) {
        tx.status = 'aborted'
        tx.abortReason = (e as Error).message

        transactionsBash.push(tx)
      }
    })

    // Updating chain's metadata
    BackendAdapter.instance
      .useWorldState()
      .update('blockchain', 'blockchain', blockchain)

    return { bond, transactionsBash }
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

    const { bond: newBond, transactionsBash } = await this.executeBlock(
      state,
      validator,
      bond
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

    this.hash = this.calculateHash()
    this.transactions = transactionsBash

    // Validator's fields
    this.validatedBy = validator.address
    this.signature = (await signMessage(privateKey, this.hash)).signature

    // Saving block
    await BackendAdapter.instance
      .useWorldState()
      .create('blocks', this.hash, this)

    return
  }

  confirm = async (previousStateHash: AddressReference) => {
    const validator = await BackendAdapter.instance
      .useState(previousStateHash)
      .read('accounts', this.validatedBy)

    if (!verifySignature(this.signature, this.hash, this.recovery)) {
      this.status = 'refused'
      this.reason = "Signature doesn't correspond to validator."
      return
    }

    const stateCollection = BackendAdapter.instance.useState(previousStateHash)

    const bond = await stateCollection.read('bonds', this.bondAddress)

    //const previousState = await stateCollection.getState()

    await this.executeBlock(previousStateHash, validator, bond)
  }
}
