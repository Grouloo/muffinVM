import chalk from 'chalk'
import inquirer from 'inquirer'
import BackendAdapter from '../../adapters/BackendAdapter'
import { composeMessage, createAccount, signMessage } from '../../common'
import createBlockchain from '../../common/createBlockchain'
import hash from '../../common/hash'
import syncBlockchain from '../../common/syncBlockchain'
import { AddressReference } from '../../models/References'
import { Muffin } from '../../models/State'
import Transaction from '../../models/Transaction'

async function create(muffin: Muffin) {
  const entries = await inquirer.prompt([
    {
      name: 'to',
      type: 'INPUT',
      message: 'Receiver:',
    },
    {
      name: 'total',
      type: 'INPUT',
      message: 'Total FLT:',
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

  const total = parseFloat(entries.total)

  const amount = total / 1.01

  const timestamp = new Date()

  const message = composeMessage(amount, nonce, '')

  const { signature, recovery } = await signMessage(entries.privateKey, message)

  const tx = await Transaction.generate(
    from as AddressReference,
    entries.to,
    total,
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
      name: 'total',
      type: 'INPUT',
      message: 'Total FLT:',
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

  const total = parseFloat(entries.total)

  const amount = total / 1.01

  const data = entries.data

  const timestamp = new Date()

  const message = composeMessage(amount, nonce, data)

  const { signature, recovery } = await signMessage(entries.privateKey, message)

  const tx = await Transaction.generate(
    from as AddressReference,
    entries.to,
    total,
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
