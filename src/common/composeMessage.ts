import { AddressReference } from '../models/References'
import hash from './hash'

export default function composeMessage(
  amount: number,
  nonce: number,
  data: string
): AddressReference {
  const message: string = `${amount}${nonce}${data}`

  const hashed = hash(message)

  return hashed
}
