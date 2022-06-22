export default function b10toHex(base10: number) {
  return `0x${Math.round(base10).toString(16)}`
}
