import BackendAdapter from '../adapters/BackendAdapter'
import Block from '../models/Block'
import Blockchain from '../models/Blockchain'
import { Meta } from '../models/State'

export default async function createBlockchain(
  path: string
): Promise<Blockchain> {
  const genesisBlock: Block = new Block({
    hash: '0x0',
    timestamp: new Date(),
    status: 'accepted',
    blockHeight: 0,
    validatedBy: '0x0',
    tax: 0.01,
    parentHash: '0x0',
    transactions: [],
    volume: 6000,
    signature: '0x0',
    bondAddress: '0x0',
  })

  const meta: Meta = {
    chainId: 1984,
    taxRate: 0.01,
    eoaCount: 1,
    contractsCount: 0,
    idealSupplyPerAccount: 6000,
    idealSupply: 6000,
    totalSupply: 6000,
    averageBlockVolume: 6000,
    blocksCount: 1,
  }

  const blockchain: Blockchain = new Blockchain({ genesisBlock, meta })

  const db = new BackendAdapter(path)

  await db.useWorldState().create('blockchain', 'blockchain', blockchain)

  // Saving genesis block
  await db.useWorldState().create('blocks', genesisBlock.hash, genesisBlock)

  return blockchain
}
