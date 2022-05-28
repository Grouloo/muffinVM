import { address } from '../types'

export interface ERC20 {
  name: () => string
  symbol: () => string
  totalSupply: () => number
  balanceOf: (owner: address) => number
  transfer: (to: address, value: number) => void
  transferFrom: (from: address, to: address, value: number) => void
  approve: (spender: address, value: number) => void
  allowance: (owner: address, spender: address) => number
}
