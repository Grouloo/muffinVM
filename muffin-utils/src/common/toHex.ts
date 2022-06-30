import { hex } from '..'

export default function toHex(uint8: Uint8Array): hex {
  const buffer = Buffer.from(uint8)
  const hex = buffer.toString('hex')

  const finalHex: hex = `0x${hex}`

  return finalHex
}
