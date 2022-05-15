import Account from './Account'
import Block from './Block'
import Bond from './Bond'
import { AddressReference } from './References'
import Transaction from './Transaction'

export interface State {
  accounts: { [x: AddressReference]: Account }
  blocks: { [x: AddressReference]: Block }
  transactions: { [x: AddressReference]: Transaction }
  bonds: {
    [x: AddressReference]: Bond
  }
  blockchain: {}
  meta?: {
    version: `${number}.${number}.${number}`
    eoaCount: number
    contractsCount: number
    idealSupplyPerAccount: number
    idealSupply: number
    totalSupply: number
  }
}

export interface Changelog {
  accounts: {
    [x: AddressReference]: {
      balance: number
      nonce: number
    }
  }
  bonds: { [x: AddressReference]: {} }
  meta: {
    [x: string]: any
  }
}

export interface Meta {
  chainId: number
  taxRate: number
  eoaCount: number
  contractsCount: number
  idealSupplyPerAccount: number
  idealSupply: number
  totalSupply: number
  averageBlockVolume: number
  blocksCount: number
}
