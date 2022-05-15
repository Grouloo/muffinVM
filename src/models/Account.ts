import hash from '../common/hash'
import BaseObject from './BaseObject'
import { AddressReference } from './References'

export interface AccountType {
  nonce: number
  balance: number
  isContract: boolean
  publicKey: string
  address: AddressReference
}

export default class Account extends BaseObject {
  nonce: number
  balance: number
  isContract: boolean
  publicKey: string
  address: AddressReference

  constructor(data: AccountType) {
    super(data)
  }

  static instantiate = (data: AccountType): Account => {
    return new this(data)
  }

  static create = (address: AddressReference) => {
    const publicKey = hash(address)

    return new this({
      address,
      publicKey,
      nonce: 0,
      balance: 0,
      isContract: false,
    })
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
