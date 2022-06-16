import BackendAdapter from '../adapters/BackendAdapter'
import { b10toHex } from '../common'
import { floatToWei } from '../ethereum'
import Account from '../models/Account'
import { AddressReference } from '../models/References'

export default async function eth_getBalance([address]: any[]) {
  try {
    const account: Account = await BackendAdapter.instance
      .useWorldState()
      .read('accounts', address)

    return b10toHex(floatToWei(account.balance))
  } catch (e) {
    return '0x0'
  }
}
