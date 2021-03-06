import chalk from 'chalk'
import Muffin from '../models/Muffin'
import account from './commands/accounts'
import benchmark from './commands/benchmark'
import blockchain from './commands/blockchain'
import blocks from './commands/blocks'
import bonds from './commands/bonds'
import contracts from './commands/contracts'
import muffinID from './commands/muffinID'
import network from './commands/network'
import sign from './commands/sign'
import transactions from './commands/transactions'
import run from './commands/run'

export const commands: {
  [command: string]:
    | {
        [method: string]:
          | ((muffin: Muffin) => void)
          | ((muffin: Muffin) => Promise<void>)
      }
    | ((muffin: Muffin) => void)
} = {
  accounts: {
    create: async (muffin: Muffin) => await account.create(),
    read: async (muffin: Muffin) => await account.read(),
    storage: async (muffin: Muffin) => await account.storage(),
    generate: async (muffin: Muffin) => account.generatePrivateKey(),
    balance: async (muffin: Muffin) => await account.balance(),
  },
  benchmark: async (muffin: Muffin) => await benchmark(),
  blockchain: {
    snap: async (muffin: Muffin) => await blockchain.snap(muffin),
    sync: async (muffin: Muffin) => await blockchain.sync(muffin),
    meta: async (muffin: Muffin) => await blockchain.meta(),
    latestBlock: async (muffin: Muffin) => await blockchain.latestBlock(),
  },
  blocks: {
    read: async (muffin: Muffin) => await blocks.read(),
    accepted: async (muffin: Muffin) => await blocks.accepted(),
    pending: async (muffin: Muffin) => await blocks.pending(),
    refused: async (muffin: Muffin) => await blocks.refused(),
    lastRefused: async (muffin: Muffin) => await blocks.lastRefused(),
  },
  bonds: {
    generate: async (muffin: Muffin) => await bonds.generate(),
  },
  contracts: {
    deploy: async (muffin: Muffin) => await contracts.deploy(muffin),
  },
  exit: (muffin: Muffin) => process.exit(),
  help: (muffin: Muffin) => console.log(commands),
  muffinID: {
    mint: async (muffin: Muffin) => await muffinID.mint(muffin),
    read: async () => await muffinID.read(),
    generateKey: async () => await muffinID.generateKey(),
    decryptField: async () => await muffinID.decryptField(),
  },
  network: {
    nodes: async (muffin: Muffin) => await network.nodes(muffin),
  },
  run: async (muffin: Muffin) => await run(),
  sign: {
    message: async (muffin: Muffin) => await sign.message(),
    verify: async (muffin: Muffin) => await sign.verify(),
  },
  transactions: {
    create: async (muffin: Muffin) => await transactions.create(muffin),
    toContract: async (muffin: Muffin) => await transactions.toContract(muffin),
    read: async (muffin: Muffin) => await transactions.read(),
    done: async (muffin: Muffin) => await transactions.done(),
    pending: async (muffin: Muffin) => await transactions.pending(),
    aborted: async (muffin: Muffin) => await transactions.aborted(),
  },
}

export default async function commandInterpreter(
  command: string,
  muffin: Muffin
) {
  if (!command) {
    return
  }

  const identifiers = command.split(' ')

  try {
    if (typeof commands[identifiers[0]] == 'function') {
      await (commands[identifiers[0]] as (muffin: Muffin) => void)(muffin)
    } else {
      await (
        commands[identifiers[0]] as {
          [method: string]:
            | ((muffin: Muffin) => void)
            | ((muffin: Muffin) => Promise<void>)
        }
      )[identifiers[1]](muffin)
    }
  } catch (e) {
    console.error(chalk.red((e as Error).message))
    console.log(e)
  }
}
