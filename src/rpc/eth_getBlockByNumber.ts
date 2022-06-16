import BackendAdapter from '../adapters/BackendAdapter'
import { toDecimal, toHex } from '../common'
import Block from '../models/Block'

export default async function eth_getBlockByNumber([
  blockNumber,
  fullTransactions,
]: any[]) {
  const parsedBlockNumber = toDecimal(blockNumber)

  const blockHeight = parsedBlockNumber - 1

  const blocks: any[] = await BackendAdapter.instance
    .useWorldState()
    .find('blocks', 'blockHeight', blockHeight)

  for (let block of blocks) {
    if (block.status == 'accepted') {
      block.number = blockNumber
      block.sealFields = []
      block.sha3Uncles = '0x0'
      block.uncles = []
      block.timestamp = toHex(block.timestamp)
      block.miner = block.validatedBy
      block.stateRoot = '0x0'
      block.receiptsRoot = '0x0'
      block.difficulty = '0x0'
      block.totalDifficulty = '0x0'
      block.extraData = '0x0'

      block.gasLimit = '0x0'
      block.minGasprice = '0x0'
      block.gasUsed = '0x0'

      block.size = '0x0'

      if (!fullTransactions) {
        const transactions = []
        for (let tx of block.transactions) {
          transactions.push(tx.hash)
        }

        block.transactions = transactions
      }
    }
    return block
  }

  return null
}
