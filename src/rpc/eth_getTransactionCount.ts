import BackendAdapter from '../adapters/BackendAdapter'
import { b10toHex } from '../common'
import Account from '../models/Account'
import { AddressReference } from '../models/References'

export default async function eth_getTransactionCount([address]: [
  AddressReference
]) {
  try {
    const account: Account = await BackendAdapter.instance
      .useWorldState()
      .read('accounts', address)

    return b10toHex(account.nonce)
  } catch (e) {
    return '0x0'
  }
}
