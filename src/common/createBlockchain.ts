import BackendAdapter from '../adapters/BackendAdapter'
import Account from '../models/Account'
import Block from '../models/Block'
import Blockchain from '../models/Blockchain'
import { AddressReference } from '../models/References'
import { Meta } from '../models/State'
import Transaction from '../models/Transaction'
import hash from './hash'

export default async function createBlockchain(
  chainId: number,
  receiverAddress: AddressReference,
  stackScript: string
): Promise<Blockchain> {
  const firstTransaction = Transaction.instantiate({
    order: 1,
    from: '0x0',
    to: receiverAddress,
    status: 'done',
    amount: 6000,
    total: 6000,
    fees: 0,
    data: '',
    signature: '0x0',
    recovery: 0,
  })

  const firstAccount = Account.instantiate({
    nonce: 0,
    balance: 6000,
    isOwned: true,
    address: receiverAddress,
  })

  const firstContract = Account.instantiate({
    nonce: 0,
    balance: 0,
    isOwned: false,
    address: '0x0',
    contract: {
      language: 'javascript',
      className: 'StackedFloat',
      script: stackScript,
      storage: {
        balances: { [receiverAddress]: 1 },
        blocks: { [receiverAddress]: 1 },
        stake: { [receiverAddress]: 1 },
        tokenTotalSupply: 1,
      },
    },
  })

  const genesisBlock: Block = new Block({
    hash: '0x0',
    timestamp: new Date(),
    status: 'accepted',
    blockHeight: 0,
    validatedBy: '0x0',
    parentHash: '0x0',
    transactions: [firstTransaction],
    volume: 6000,
    signature: '0x0',
    recovery: 0,
  })

  const meta: Meta = {
    chainId: chainId,
    taxRate: 0.01,
    eoaCount: 1,
    contractsCount: 1,
    idealSupplyPerAccount: 6000,
    idealSupply: 6000,
    totalSupply: 6000,
    averageBlockVolume: 6000,
    blocksCount: 1,
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

  // Saving transaction
  await BackendAdapter.instance
    .useState(genesisBlock.hash)
    .create('transactions', firstTransaction.hash, firstTransaction)

  // Saving account
  await BackendAdapter.instance
    .useWorldState()
    .create('accounts', firstAccount.address, firstAccount)

  // Saving contract
  await BackendAdapter.instance
    .useWorldState()
    .create('accounts', firstContract.address, firstContract)

  return blockchain
}
