import chalk from 'chalk'
import { Muffin } from '../models/State'
import account from './commands/accounts'
import blockchain from './commands/blockchain'
import bonds from './commands/bonds'
import sign from './commands/sign'
import network from './commands/network'
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
  blockchain: {
    init: async (muffin: Muffin) => await blockchain.init(''),
    meta: async (muffin: Muffin) => await blockchain.meta(),
    latestBlock: async (muffin: Muffin) => await blockchain.latestBlock(),
  },
  bonds: {
    generate: async (muffin: Muffin) => await bonds.generate(),
  },
  exit: (muffin: Muffin) => process.exit(),
  help: (muffin: Muffin) => console.log(commands),
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
    read: async (muffin: Muffin) => await transactions.read(),
  },
}

export default async function commandInterpreter(
  command: string,
  muffin: Muffin
) {
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
