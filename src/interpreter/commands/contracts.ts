import chalk from 'chalk'
import inquirer from 'inquirer'
import BackendAdapter from '../../adapters/BackendAdapter'
import {
  composeMessage,
  createAccount,
  signMessage,
  calculateContractAddress,
  calculateFees,
} from '../../common'
import Account, { ContractType } from '../../models/Account'
import Blockchain from '../../models/Blockchain'
import Muffin from '../../models/Muffin'
import { AddressReference } from '../../models/References'
import Transaction from '../../models/Transaction'
import deployment from '../../../deployment.json'

async function deploy(muffin: Muffin) {
  console.log(chalk.yellow('Fetching data from deployment.json file'))

  const entries = await inquirer.prompt([
    {
      name: 'amount',
      type: 'INPUT',
      message: 'Amount (in FLT):',
    },
    {
      name: 'privateKey',
      type: 'INPUT',
      message: 'Private key:',
    },
  ])

  const { privateKey } = entries
  const { script, className } = deployment

  const amount = parseFloat(entries.amount)

  const { meta }: Blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  const size = script.length
  const fees = calculateFees(amount, meta.taxRate, script)

  const data: ContractType = {
    script,
    className,
    size,
    environment: 'nodejs',
    storage: {},
  }

  const stringifiedData = JSON.stringify(data)

  const { address } = createAccount(privateKey)

  const account: Account = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', address)

  const message = await composeMessage({
    nonce: account.nonce,
    fees,
    to: null,
    amount,
    data: stringifiedData,
  })

  const { signature, recovery } = await signMessage(privateKey, message)

  const transaction = await Transaction.generate(
    address as AddressReference,
    null,
    amount,
    stringifiedData,
    signature,
    recovery,
    muffin,
    new Date()
  )

  const contractAddress = calculateContractAddress(address, account.nonce)

  console.log(chalk.green(`Deployment sent to the network!`))
  console.log(chalk.blue(`Contract address: ${contractAddress}`))
  console.log(chalk.green(`Transaction hash: ${transaction.hash}`))

  return
}

export default { deploy }
