import { ecdsaSign } from 'secp256k1'
import { AddressReference } from '../models/References'
import toHex from './toHex'
import * as secp from '@noble/secp256k1'

export default async function signMessage(
  privateKey: string,
  message: AddressReference
) {
  const [signatureBuffer, recovery] = await secp.sign(
    message.slice(2),
    privateKey,
    {
      recovered: true,
    }
  )
  const signature = toHex(signatureBuffer)

  return { signature, recovery }
}
