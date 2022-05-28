import { AddressReference } from '../models/References'
import BackendAdapter from '../adapters/BackendAdapter'
import vm from 'vm'
import * as muffin from 'muffin-utils'
import Account from '../models/Account'
import chalk from 'chalk'

export default async function executeApp(
  senderAddress: AddressReference,
  receiverAddress: AddressReference,
  method: string,
  args: any[]
) {
  const account: Account = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', receiverAddress)

  // Account has to ben an executable contract
  if (account.isOwned) {
    throw 'Not executable.'
  }

  if (!account.contract) {
    throw 'Missing informations.'
  }

  console.log(chalk.yellow(`Running ${account.contract.className}`))

  const context: {
    storage: { [x: string]: any }
    'muffin-utils': any
    res: any
    require?: any
    module?: any
    console?: any
  } = {
    storage: { ...account.contract.storage, msg: { sender: senderAddress } },
    res: undefined,
    'muffin-utils': muffin,
    require,
    module,
    // console,
  }

  let params = ''
  args.map((arg: any, index: number) => {
    params += typeof arg == 'string' ? `"${arg}"` : arg

    if (index != args.length - 1) {
      params += ','
    }
  })

  const script = `(function(exports){${account.contract.script} \n const app = new ${account.contract.className}(storage);\n res = app.${method}(${params});\n storage = app._toJSON();}(module.exports));`

  const executableScript = new vm.Script(script)

  vm.createContext(context)

  executableScript.runInContext(context)

  const { storage, res } = context

  return { storage, res }
}
