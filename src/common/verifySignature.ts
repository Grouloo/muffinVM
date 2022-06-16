import { AddressReference } from '../models/References'
import * as secp from '@noble/secp256k1'
import hash from './hash'

export default function verifySignature(
  signature: AddressReference,
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

  const address: AddressReference = `0x${publicKeyHash.slice(26)}`

  return { address, publicKey }
}
