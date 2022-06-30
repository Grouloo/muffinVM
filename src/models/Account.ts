import BackendAdapter from '../adapters/BackendAdapter'
import hash from '../common/hash'
import BaseObject from './BaseObject'
import { AddressReference } from './References'

export interface ContractType {
  environment: 'nodejs'
  className: string
  script: string
  size: number
  storage: { [x: string]: any }
}

export interface AccountType {
  nonce: number
  balance: number
  isOwned: boolean
  address: AddressReference
  contract?: ContractType
}

export default class Account extends BaseObject {
  nonce: number
  balance: number
  isOwned: boolean
  address: AddressReference
  contract?: ContractType

  constructor(data: AccountType) {
    super(data)
  }

  static instantiate = (data: AccountType): Account => {
    return new this(data)
  }

  static create = (address: AddressReference) => {
    return new this({
      address,
      nonce: 0,
      balance: 0,
      isOwned: true,
    })
  }

  static getBalance = async (address: AddressReference) => {
    const account = await BackendAdapter.instance
      .useWorldState()
      .read('accounts', address)

    if (!account) {
      throw Error("This account doesn't exist.")
    }

    return account.balance
  }

  add = (value: number): number => {
    const parsedValue = parseFloat(value as any)

    if (parsedValue < 0) {
      throw Error('Value must be positive.')
    }

    this.balance += parsedValue

    return this.balance
  }

  withdraw = (value: number): number => {
    const parsedValue = parseFloat(value as any)

    if (parsedValue < 0) {
      throw 'Value must be positive.'
    }

    if (this.balance < parsedValue) {
      throw Error('Balance insufficient.')
    }

    this.balance -= parsedValue

    return this.balance
  }
}
