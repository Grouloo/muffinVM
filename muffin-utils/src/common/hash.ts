import keccak256 from 'keccak256'
import toHex from './toHex'

export default function hash(message: string | Buffer) {
  const hash = keccak256(message)

  const hexHash = toHex(hash)

  return hexHash
}
