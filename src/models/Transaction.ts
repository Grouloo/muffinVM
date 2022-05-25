import sha256 from 'fast-sha256'
import util from 'tweetnacl-util'
import BackendAdapter from '../adapters/BackendAdapter'
import hash from '../common/hash'
import BaseObject from './BaseObject'
import { AddressReference } from './References'
import { Muffin } from './State'

export interface TransactionInterface {
  hash?: AddressReference
  order?: number
  timestamp?: Date
  signature: AddressReference
  recovery: number
  from: AddressReference
  to: AddressReference
  status: 'pending' | 'aborted' | 'done'
  abortReason?: string
  amount: number
  fees: number
  total: number
  data: string
}

export default class Transaction
  extends BaseObject
  implements TransactionInterface
{
  hash: AddressReference = '0x0'
  order?: number
  timestamp: Date = new Date()
  signature: AddressReference
  recovery: number
  from: AddressReference
  to: AddressReference
  status: 'pending' | 'aborted' | 'done'
  abortReason?: string
  amount: number
  fees: number
  total: number
  data: string

  constructor(data: TransactionInterface) {
    super(data)
    this.calculateHash()
  }

  static instantiate = (data: TransactionInterface) => {
    return new this(data)
  }

  static generate = async (
    from: AddressReference,
    to: AddressReference,
    total: number,
    data: '',
    signature: AddressReference,
    recovery: number,
    muffin: Muffin,
    timestamp: Date = new Date()
  ) => {
    const fees = total * 0.01
    const amount = total - fees

    const txHash = hash(
      `${from}${to}${amount}${fees}${total}${data}${timestamp}`
    )

    const tx = new this({
      hash: txHash,
      status: 'pending',
      timestamp,
      from,
      to,
      amount,
      fees,
      total,
      data,
      signature,
      recovery,
    })

    await BackendAdapter.instance
      .useWorldState()
      .create('transactions', tx.hash, tx)

    await muffin.net.broadcast('transactions', tx._toJSON())

    return tx
  }

  calculateHash = (): string => {
    const summedData: string = `${this.from}${this.to}${this.amount}${
      this.fees
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
