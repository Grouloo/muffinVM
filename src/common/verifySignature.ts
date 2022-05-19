import { ecdsaVerify } from 'secp256k1'
import util from 'tweetnacl-util'
import Account from '../models/Account'
import { AddressReference } from '../models/References'
import toUint8Array from './toUint8Array'
import * as secp from '@noble/secp256k1'
import hash from './hash'
import { Console } from 'console'

export default function verifySignature(
  signature: AddressReference,
  message: string,
  recovery: number
): any {
  const publicKey = secp.recoverPublicKey(message, signature, recovery)

  const parsedPublicKey = Buffer.from(publicKey).toString('hex').slice(2)

  const publicKeyHash = hash(Buffer.from(parsedPublicKey, 'hex'))

  const address = `0x${publicKeyHash.slice(26)}`

  return { address, publicKey }
}
