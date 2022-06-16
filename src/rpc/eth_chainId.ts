import { Express } from 'express'
import BackendAdapter from '../adapters/BackendAdapter'
import { b10toHex } from '../common'
import Blockchain from '../models/Blockchain'

export default async function eth_chainId(params: any) {
  const { meta }: Blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  return b10toHex(meta.chainId)
}
