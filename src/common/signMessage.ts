import { ecdsaSign } from 'secp256k1'
import util from 'tweetnacl-util'
import hash from './hash'
import { AddressReference } from '../models/References'
import toHex from './toHex'
import keccak256 from 'keccak256'

export default function signMessage(
  privateKey: AddressReference,
  message: string
): AddressReference {
  const messageBuffer = keccak256(message)

  const privateKeyBuffer = Buffer.from(privateKey, 'hex')

  const { signature: signatureBuffer } = ecdsaSign(
    messageBuffer,
    privateKeyBuffer
  )
  const signature = toHex(signatureBuffer)

  return signature
}
