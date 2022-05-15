import BaseObject from './BaseObject'
import Block from './Block'
import { AddressReference } from './References'
import { Meta, State } from './State'

export default class Blockchain extends BaseObject {
  genesisBlock: Block
  stateHash: AddressReference
  meta: Meta

  constructor(data: Partial<Blockchain>) {
    super(data)
  }

  static init = (genesisBlock: Block) => {
    return new this({ genesisBlock, stateHash: genesisBlock.hash })
  }
}
