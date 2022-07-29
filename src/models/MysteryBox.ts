import hash from '../common/hash'
import BaseObject from './BaseObject'
import { AddressReference } from './References'
import Muffin from './Muffin'
import BackendAdapter from '../adapters/BackendAdapter'

export interface MysteryBoxType {
  hash?: AddressReference
  createdAt: number
  status: 'empty' | 'full' | 'outdated'
  content: any
  publicKey: string
  signature?: AddressReference
  recovery?: number
}

export default class MysteryBox extends BaseObject implements MysteryBoxType {
  hash: AddressReference
  createdAt: number
  status: 'empty' | 'full' | 'outdated'
  content: any
  publicKey: string
  signature?: AddressReference
  recovery?: number

  constructor(data: MysteryBoxType) {
    super(data)

    if (data.createdAt) {
      this.createdAt = data.createdAt
    } else {
      this.createdAt = new Date().getTime()
    }

    this.hash = hash(`${this.createdAt}-${this.publicKey}`)
  }

  static instantiate = (data: MysteryBoxType) => {
    return new this(data)
  }

  static generate = async (publicKey: AddressReference) => {
    const createdAt = new Date().getTime()

    const boxHash = hash(`${createdAt}-${publicKey}`)

    const mysteryBox = new this({
      createdAt,
      status: 'empty',
      publicKey,
      content: null,
    })

    await BackendAdapter.instance
      .useMysteryBoxState()
      .create('mysteryBoxes', boxHash, mysteryBox)

    return mysteryBox
  }
}
