import * as secp from '@noble/secp256k1'
import { address } from '..'
import hash from './hash'

export default function verifySignature(
  signature: address,
  message: string,
  recovery: number
) {
  const publicKey = secp.recoverPublicKey(
    message.slice(2),
    signature.slice(2),
    recovery
  )

  const parsedPublicKey = Buffer.from(publicKey).toString('hex').slice(2)

  const publicKeyHash = hash(Buffer.from(parsedPublicKey, 'hex'))

  const address: address = `0x${publicKeyHash.slice(26)}`

  return { address, publicKey }
}
