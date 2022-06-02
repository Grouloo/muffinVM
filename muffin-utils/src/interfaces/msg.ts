import { address } from '../types'

export interface msg {
  sender: address
  amount: number
  makeTransaction: (to: address, total: number) => void
}
