import BaseObject from './BaseObject'
import Block from './Block'
import { AddressReference } from './References'
import { Meta, State } from './State'

export interface BlockchainType {
  genesisBlock: Block
  currentBlockHash: AddressReference
  meta: Meta
}

export default class Blockchain extends BaseObject implements BlockchainType {
  genesisBlock: Block
  currentBlockHash: AddressReference
  meta: Meta

  constructor(data: BlockchainType) {
    super(data)
  }

  static init = (genesisBlock: Block, meta: Meta) => {
    return new this({ genesisBlock, currentBlockHash: genesisBlock.hash, meta })
  }
}
