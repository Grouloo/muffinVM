import { publicKeyCreate } from 'secp256k1'
import * as secp from '@noble/secp256k1'
import hash from './hash'

export default function createAccount(privateKey: string) {
  const key = Buffer.from(privateKey, 'hex')

  const addressBuffer = secp.getPublicKey(key, false)

  const basePubKey = Buffer.from(addressBuffer).toString('hex').slice(2)

  const publicKey = hash(Buffer.from(basePubKey, 'hex'))

  const address = `0x${publicKey.slice(26)}`

  return { address, publicKey }
}
