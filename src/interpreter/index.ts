import chalk from 'chalk'
import account from './commands/account'
import blockchain from './commands/blockchain'
import bonds from './commands/bonds'
import sign from './commands/sign'

export const commands: {
  [command: string]:
    | {
        [method: string]: ((arg?: any) => void) | ((arg?: any) => Promise<void>)
      }
    | ((arg?: any) => void)
} = {
  account: {
    create: async () => await account.create(),
    generate: async () => account.generatePrivateKey(),
    balance: async () => await account.balance(),
  },
  blockchain: {
    init: async (path: string) => await blockchain.init(path),
    meta: async () => await blockchain.meta(),
    latestBlock: async () => await blockchain.latestBlock(),
  },
  bonds: {
    generate: async () => await bonds.generate(),
  },
  exit: () => process.exit(),
  help: () => console.log(commands),
  sign: {
    message: async () => await sign.message(),
    verify: async () => await sign.verify(),
  },
}

export default async function commandInterpreter(command: string) {
  const identifiers = command.split(' ')

  try {
    if (typeof commands[identifiers[0]] == 'function') {
      await (commands[identifiers[0]] as () => void)()
    } else {
      await (
        commands[identifiers[0]] as {
          [method: string]: (() => void) | (() => Promise<void>)
        }
      )[identifiers[1]]()
    }
  } catch (e) {
    console.error(chalk.red((e as Error).message))
    console.log(e)
  }
}
