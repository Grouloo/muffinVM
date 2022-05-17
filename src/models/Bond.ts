import hash from '../common/hash'
import BaseObject from './BaseObject'
import { AddressReference } from './References'
import { Meta } from './State'

export interface BondType {
  hash: AddressReference
  owner?: AddressReference
  principal: number
  interest: number
  rate: number
  value: number
  remainingBlocks: number
  payed: number
  status: 'pending' | 'stacked' | 'active' | 'canceled' | 'payed'
}

export default class Bond extends BaseObject implements BondType {
  hash: AddressReference
  owner: AddressReference
  principal: number
  interest: number
  rate: number
  value: number
  remainingBlocks: number
  payed: number
  status: 'pending' | 'stacked' | 'active' | 'canceled' | 'payed'

  constructor(data: BondType) {
    super(data)
  }

  static generate = (meta: Meta) => {
    const principal = meta.averageBlockVolume
    const value =
      meta.idealSupply - meta.totalSupply + principal * (meta.taxRate + 1)

    let rate = 0.01
    let remainingBlocks = Math.floor((value - principal) / (principal * rate))

    if (remainingBlocks < 10) {
      remainingBlocks = 10
      rate = remainingBlocks / principal
    }

    const interest = (value - principal) / remainingBlocks

    const bondHash = hash(`${principal}${value}${remainingBlocks}`)

    return new Bond({
      hash: bondHash,
      principal,
      value,
      rate,
      remainingBlocks,
      interest,
      payed: 0,
      status: 'pending',
    })
  }
}
