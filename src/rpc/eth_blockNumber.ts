import BackendAdapter from '../adapters/BackendAdapter'
import { b10toHex } from '../common'
import Blockchain from '../models/Blockchain'

export default async function eth_blockNumber(params: any) {
  const { meta }: Blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  return b10toHex(meta.blocksCount)
}
