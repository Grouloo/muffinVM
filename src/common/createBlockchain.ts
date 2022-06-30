import BackendAdapter from '../adapters/BackendAdapter'
import Account, { ContractType } from '../models/Account'
import Block from '../models/Block'
import Blockchain from '../models/Blockchain'
import { AddressReference } from '../models/References'
import { Meta } from '../models/State'
import genesis from '../../genesis.json'

export default async function createBlockchain(): Promise<Blockchain> {
  let eoaCount: number = 0
  let contractsCount: number = 0
  let totalFloat: number = 0

  await Promise.all(
    genesis.accounts.map(async (element: any) => {
      let contract: ContractType | undefined = undefined
      if (!element.isOwned) {
        contract = {
          environment: element.contract.environment,
          className: element.contract.className,
          script: element.contract.script,
          size: element.contract.script.length,
          storage: element.contract.storage,
        }

        contractsCount++
      } else {
        eoaCount++
      }

      const account = Account.instantiate({
        nonce: element.nonce || 0,
        address: element.address,
        balance: element.balance,
        isOwned: element.isOwned || false,
        contract: contract,
      })

      totalFloat += account.balance

      // Saving account
      // Saving void account
      await BackendAdapter.instance
        .useWorldState()
        .create('accounts', element.address, account)
    })
  )

  const voidAccount = Account.instantiate({
    nonce: 0,
    balance: 0,
    isOwned: true,
    address: null as unknown as AddressReference,
  })

  const genesisBlock: Block = new Block({
    hash: genesis.blockHash as AddressReference,
    timestamp: new Date(),
    status: 'accepted',
    blockHeight: genesis.blockHeight,
    validatedBy: '0x0',
    parentHash: '0x0',
    transactions: [],
    volume: 6000,
    signature: '0x0',
    recovery: 0,
  })

  const meta: Meta = {
    chainId: genesis.chainId,
    taxRate: genesis.taxRate,
    eoaCount,
    contractsCount,
    idealSupplyPerAccount: totalFloat / eoaCount,
    idealSupply: totalFloat,
    totalSupply: totalFloat,
    averageBlockVolume: totalFloat,
    blocksCount: genesis.blockHeight + 1,
  }

  const blockchain: Blockchain = Blockchain.init(genesisBlock, meta)

  // Saving blockchain
  await BackendAdapter.instance
    .useWorldState()
    .create('blockchain', 'blockchain', blockchain)

  // Saving genesis block
  await BackendAdapter.instance
    .useWorldState()
    .create('blocks', genesisBlock.hash, genesisBlock)

  // Saving void account
  await BackendAdapter.instance
    .useWorldState()
    .create('accounts', '', voidAccount)

  return blockchain
}
