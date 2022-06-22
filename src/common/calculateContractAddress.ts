import hash from './hash'
import { encodeRLP } from '../ethereum'
import { AddressReference } from '../models/References'

// Computing contract address
export default function calculateContractAddress(
  address: AddressReference,
  nonce: number
) {
  const contractAddress: AddressReference = `0x${hash(
    encodeRLP([address, nonce])
  ).slice(26)}`

  return contractAddress
}
