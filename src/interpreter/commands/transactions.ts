import chalk from 'chalk'
import inquirer from 'inquirer'
import BackendAdapter from '../../adapters/BackendAdapter'
import {
  calculateFees,
  composeMessage,
  createAccount,
  signMessage,
} from '../../common'
import { AddressReference } from '../../models/References'
import Muffin from '../../models/Muffin'
import Transaction from '../../models/Transaction'
import Blockchain from '../../models/Blockchain'

async function create(muffin: Muffin) {
  const entries = await inquirer.prompt([
    {
      name: 'to',
      type: 'INPUT',
      message: 'Receiver:',
    },
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

  const { address: from } = createAccount(entries.privateKey)

  const { nonce } = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', from)

  const { meta }: Blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  const amount = parseFloat(entries.amount)

  const fees = calculateFees(amount, meta.taxRate)

  const timestamp = new Date()

  const message = await composeMessage({
    amount,
    nonce,
    fees,
    to: entries.to,
    data: '',
  })

  const { signature, recovery } = await signMessage(entries.privateKey, message)

  const tx = await Transaction.generate(
    from as AddressReference,
    entries.to,
    amount,
    '',
    signature,
    recovery,
    muffin,
    timestamp
  )

  console.log(chalk.green('Transaction created!'))

  console.log(`Transaction hash: ${tx.hash}`)

  return
}

async function toContract(muffin: Muffin) {
  const entries = await inquirer.prompt([
    {
      name: 'to',
      type: 'INPUT',
      message: 'Receiver:',
    },
    {
      name: 'amount',
      type: 'INPUT',
      message: 'Amount (in FLT):',
    },
    {
      name: 'data',
      type: 'INPUT',
      message: 'Data:',
    },
    {
      name: 'privateKey',
      type: 'INPUT',
      message: 'Private key:',
    },
  ])

  const { address: from } = createAccount(entries.privateKey)

  const { nonce } = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', from)

  const { meta }: Blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  const amount = parseFloat(entries.amount)

  const fees = calculateFees(amount, meta.taxRate)

  const data = entries.data

  const timestamp = new Date()

  const message = await composeMessage({
    amount,
    nonce,
    data,
    fees,
    to: entries.to,
  })

  const { signature, recovery } = await signMessage(entries.privateKey, message)

  const tx = await Transaction.generate(
    from as AddressReference,
    entries.to,
    amount,
    data,
    signature,
    recovery,
    muffin,
    timestamp
  )

  console.log(chalk.green('Transaction created!'))

  console.log(`Transaction hash: ${tx.hash}`)

  return
}

async function read() {
  const entries = await inquirer.prompt([
    {
      name: 'hash',
      type: 'INPUT',
      message: 'Hash:',
    },
  ])

  const transaction = await BackendAdapter.instance
    .useWorldState()
    .read('transactions', entries.hash)

  console.log(transaction._toJSON())

  return
}

async function done() {
  const transactions = await BackendAdapter.instance
    .useWorldState()
    .find('transactions', 'status', 'done', 'asc')

  console.log(transactions)

  return
}

async function pending() {
  const transactions = await BackendAdapter.instance
    .useWorldState()
    .find('transactions', 'status', 'pending', 'asc')

  console.log(transactions)

  return
}

async function aborted() {
  const transactions = await BackendAdapter.instance
    .useWorldState()
    .find('transactions', 'status', 'aborted', 'asc')

  console.log(transactions)

  return
}

export default { create, toContract, read, done, pending, aborted }
