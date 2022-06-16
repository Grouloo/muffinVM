import BackendAdapter from '../adapters/BackendAdapter'
import { b10toHex } from '../common'
import Blockchain from '../models/Blockchain'

export default async function eth_gasPrice() {
  const { meta }: Blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  return '0x1' // b10toHex(meta.taxRate)
}
