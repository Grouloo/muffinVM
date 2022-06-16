import { serviceContract } from 'ataraxia-service-contracts'
import BackendAdapter from '../adapters/BackendAdapter'
import { toHex } from '../common'
import Account from '../models/Account'
import { AddressReference } from '../models/References'

export default async function eth_getCode([address]: [AddressReference]) {
  const account: Account = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', address)

  if (!account) {
    return '0x'
  }

  if (!account.contract) {
    return '0x'
  }

  const rawCode = account.contract.script
  return toHex(Buffer.from(rawCode))
}
