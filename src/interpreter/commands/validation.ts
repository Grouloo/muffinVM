import chalk from 'chalk'
import inquirer from 'inquirer'
import BackendAdapter from '../../adapters/BackendAdapter'
import { createAccount, signMessage } from '../../common'
import createBlockchain from '../../common/createBlockchain'
import hash from '../../common/hash'
import syncBlockchain from '../../common/syncBlockchain'
import Block from '../../models/Block'
import { AddressReference } from '../../models/References'
import { Muffin } from '../../models/State'
import Transaction from '../../models/Transaction'

async function start(muffin: Muffin) {
  const entries = await inquirer.prompt([
    {
      name: 'privateKey',
      type: 'INPUT',
      message: 'Private key:',
    },
  ])

  const privateKey = entries.privateKey

  console.log(chalk.yellow('Starting validation...'))

  // Block.generate()

  // console.log(`Transaction hash: ${tx.hash}`)

  return
}

export default { start }
