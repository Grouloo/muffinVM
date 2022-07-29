import { AddressReference } from '../models/References'
import BackendAdapter from '../adapters/BackendAdapter'
import vm from 'vm'
import * as muffin from 'muffin-utils'
import Account from '../models/Account'
import chalk from 'chalk'

export default async function executeApp(
  senderAddress: AddressReference,
  receiverAddress: AddressReference,
  amount: number,
  method: string,
  args: string //any[]
) {
  const account: Account = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', receiverAddress)

  // Account has to ben an executable contract
  if (account.isOwned) {
    throw Error('Not executable.')
  }

  if (!account.contract) {
    throw Error('Missing informations.')
  }

  //console.log(chalk.yellow(`Running ${account.contract.className}`))
  try {
    const makeTransaction = (to: muffin.address, amount: number) => {
      tx.push({ from: receiverAddress, to, amount, fees: 0, total: amount })
    }

    const context: {
      storage: { [x: string]: any }
      tx: any[]
      'muffin-utils': any
      res: any
      require?: any
      module?: any
      console?: any
    } = {
      storage: {
        ...account.contract.storage,
        msg: { sender: senderAddress, amount, makeTransaction },
      },
      tx: [],
      res: undefined,
      'muffin-utils': muffin,
      require,
      module,
      // console,
    }

    let params = ''
    /*args.map((arg: any, index: number) => {
      params += /^\d+$/.test(arg) ? parseFloat(arg) : `'${arg}'`

      if (index != args.length - 1) {
        params += ','
      }
    })*/

    const script = `(function(exports){${
      account.contract.script
    } \n const app = new ${
      account.contract.className
    }(storage);\n res = app.${method}(${
      args /*params*/
    });\n storage = app._toJSON();}(module.exports));`

    // console.log(script)

    const executableScript = new vm.Script(script)

    vm.createContext(context)

    await executableScript.runInContext(context, { timeout: 5000 })

    const { storage, res, tx } = context

    return { storage, res, tx }
  } catch (e) {
    throw Error(
      `${account.contract.className}.${method}: ${(e as Error).message}`
    )
  }
}
