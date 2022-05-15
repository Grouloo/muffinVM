import { AddressReference } from '../models/References'

export default function toHex(uint8: Uint8Array): AddressReference {
  const buffer = Buffer.from(uint8)
  const hex = buffer.toString('hex')

  const finalHex: AddressReference = `0x${hex}`

  return finalHex
}
