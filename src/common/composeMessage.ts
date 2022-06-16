import BackendAdapter from '../adapters/BackendAdapter'
import { encodeRLP, floatToWei } from '../ethereum'
import Blockchain from '../models/Blockchain'
import { AddressReference } from '../models/References'
import hash from './hash'

/**
 * Takes a Transaction object as arg and compose a EIP-155 hash signing
 * @param amount
 * @param nonce
 * @param data
 * @returns Message hash
 */
export default async function composeMessage(tx: {
  nonce: number
  fees: number
  to: AddressReference
  amount: number
  data: string
}): Promise<AddressReference> {
  const { meta }: Blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  const chainId = meta.chainId

  const value = floatToWei(tx.amount)

  const gasPrice = 1
  const gasLimit = floatToWei(tx.fees)

  // console.log({ gasPrice, gasLimit })

  const message = encodeRLP([
    tx.nonce,
    gasPrice,
    gasLimit,
    tx.to,
    value,
    tx.data,
    chainId,
    '',
    '',
  ])

  // console.log(message)

  const hashed = hash(Buffer.from(message.slice(2), 'hex'))

  return hashed
}
