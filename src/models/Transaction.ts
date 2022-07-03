import sha256 from 'fast-sha256'
import util from 'tweetnacl-util'
import BackendAdapter from '../adapters/BackendAdapter'
import { calculateFees } from '../common'
import hash from '../common/hash'
import BaseObject from './BaseObject'
import { AddressReference } from './References'
import Muffin from './Muffin'
import Blockchain from './Blockchain'

export interface TransactionInterface {
  hash?: AddressReference
  order?: number
  timestamp?: Date
  signature?: AddressReference
  recovery?: number
  from: AddressReference
  to: AddressReference | null
  status: 'pending' | 'aborted' | 'done'
  abortReason?: string
  amount: number
  fees: number
  total: number
  data: string
  internalTransactions?: Transaction[]
  contractAddress?: AddressReference
}

export default class Transaction
  extends BaseObject
  implements TransactionInterface
{
  hash: AddressReference = '0x0'
  order?: number
  timestamp: Date
  signature?: AddressReference
  recovery?: number
  from: AddressReference
  to: AddressReference | null
  status: 'pending' | 'aborted' | 'done'
  abortReason?: string
  amount: number
  fees: number
  total: number
  data: string
  internalTransactions?: Transaction[]
  contractAddress?: AddressReference

  constructor(data: TransactionInterface) {
    super(data)

    if (!data.timestamp) {
      this.timestamp = new Date()
    }

    if (typeof this.amount != 'number') {
      this.amount = parseFloat(this.amount)
    }

    if (typeof this.fees != 'number') {
      this.fees = parseFloat(this.fees)
    }

    if (typeof this.total != 'number') {
      this.total = parseFloat(this.total)
    }

    this.calculateHash()
  }

  static instantiate = (data: TransactionInterface) => {
    return new this(data)
  }

  static generate = async (
    from: AddressReference,
    to: AddressReference | null,
    amount: number,
    data: string,
    signature: AddressReference,
    recovery: number,
    muffin: Muffin,
    timestamp: Date = new Date()
  ) => {
    const { meta }: Blockchain = await BackendAdapter.instance
      .useWorldState()
      .read('blockchain', 'blockchain')

    let fees
    if (to == null) {
      const { script } = JSON.parse(data)

      fees = calculateFees(amount, meta.taxRate, script)
    } else {
      fees = calculateFees(amount, meta.taxRate)
    }

    const total = amount + fees

    const txHash = hash(
      `${from}${to}${amount}${fees}${total}${data}${timestamp}`
    )

    if (to) {
      to = to.toLowerCase() as AddressReference
    }

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
    }${this.total}${this.data}${new Date(this.timestamp)}`

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
