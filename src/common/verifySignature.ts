import { ecdsaVerify } from 'secp256k1'
import util from 'tweetnacl-util'
import Account from '../models/Account'
import { AddressReference } from '../models/References'
import toUint8Array from './toUint8Array'

export default function verifySignature(
  signature: AddressReference,
  message: string,
  account: Account
): boolean {
  const signatureBuffer = toUint8Array(signature)

  const publicKey = toUint8Array(account.publicKey)

  const messageBuffer = util.decodeUTF8(message)

  const verification = ecdsaVerify(signatureBuffer, messageBuffer, publicKey)

  return verification
}
