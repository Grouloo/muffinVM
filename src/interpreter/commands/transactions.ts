import chalk from 'chalk'
import inquirer from 'inquirer'
import BackendAdapter from '../../adapters/BackendAdapter'
import { createAccount, signMessage } from '../../common'
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

  const fees = entries.total * 0.01
  const amount = entries.total - fees

  const timestamp = new Date()

  const { signature, recovery } = await signMessage(
    entries.privateKey,
    hash(
      `${from}${entries.to}${amount}${fees}${entries.total}${timestamp}`
    ).slice(2) as AddressReference
  )

  const tx = await Transaction.generate(
    from as AddressReference,
    entries.to,
    entries.total,
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

export default { create, read }
