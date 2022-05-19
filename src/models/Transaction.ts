import sha256 from 'fast-sha256'
import util from 'tweetnacl-util'
import BaseObject from './BaseObject'
import { AddressReference } from './References'

export interface TransactionInterface {
  hash?: AddressReference
  order: number
  signature: AddressReference
  recovery: number
  from: AddressReference
  to: AddressReference
  status: 'pending' | 'aborted' | 'done'
  abortReason?: string
  amount: number
  gas: number
  total: number
  data: string
}

export default class Transaction
  extends BaseObject
  implements TransactionInterface
{
  hash: AddressReference = '0x0'
  order: number
  signature: AddressReference
  recovery: number
  from: AddressReference
  to: AddressReference
  status: 'pending' | 'aborted' | 'done'
  abortReason?: string
  amount: number
  gas: number
  total: number
  data: string

  constructor(data: TransactionInterface) {
    super(data)
    this.calculateHash()
  }

  static instantiate = (data: TransactionInterface) => {
    return new this(data)
  }

  calculateHash = (): string => {
    const summedData: string = `${this.from}${this.to}${this.amount}${
      this.gas
    }${this.total}${JSON.stringify(this.data)}`

    const decodedSummedData: Uint8Array = util.decodeUTF8(summedData)

    const hash: Uint8Array = sha256(decodedSummedData)

    const encodedHash: string = util.encodeBase64(hash)

    const hexHash: AddressReference = `0x${encodeURIComponent(
      encodedHash
    ).replace(/%/g, '')}`

    this.hash = hexHash
    return hexHash
  }
}
