import BackendAdapter from '../adapters/BackendAdapter'
import hash from '../common/hash'
import BaseObject from './BaseObject'
import { AddressReference } from './References'

export interface AccountType {
  nonce: number
  balance: number
  isContract: boolean
  address: AddressReference
}

export default class Account extends BaseObject {
  nonce: number
  balance: number
  isContract: boolean
  address: AddressReference

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
      isContract: false,
    })
  }

  static getBalance = async (address: AddressReference) => {
    const account = await BackendAdapter.instance
      .useWorldState()
      .read('accounts', address)

    if (!account) {
      throw "This account doesn't exist."
    }

    return account.balance
  }

  add = (value: number): number => {
    if (value < 0) {
      throw 'Value must be positive.'
    }

    this.balance += value

    return this.balance
  }

  withdraw = (value: number): number => {
    if (value < 0) {
      throw 'Value must be positive.'
    }

    if (this.balance < value) {
      throw 'Balance insufficient.'
    }

    this.balance -= value

    return this.balance
  }
}
