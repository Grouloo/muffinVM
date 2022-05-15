export default function toUint8Array(hex: string) {
  const parsedHex = hex.replace('0x', '')

  const buffer = Buffer.from(parsedHex)

  const uint8 = Uint8Array.from(buffer)

  return uint8
}
