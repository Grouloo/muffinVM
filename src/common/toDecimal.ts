import { AddressReference } from '../models/References'

export default function toDecimal(base16: AddressReference) {
  return parseInt(base16.slice(2), 16)
}
