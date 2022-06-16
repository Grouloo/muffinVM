import chalk from 'chalk'
import inquirer from 'inquirer'
import BackendAdapter from '../../adapters/BackendAdapter'
import { createAccount, signMessage } from '../../common'
import createBlockchain from '../../common/createBlockchain'
import hash from '../../common/hash'
import syncBlockchain from '../../common/syncBlockchain'
import Block from '../../models/Block'
import { AddressReference } from '../../models/References'
import Muffin from '../../models/Muffin'
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

  const { address } = createAccount(privateKey)

  console.log(chalk.yellow('Starting validation...'))

  // We create a new block every 30s
  setInterval(async function () {
    // Generating a new block with the oldest transactions
    const newBlock = await Block.generate(address as AddressReference)

    const { signature, recovery } = await signMessage(privateKey, newBlock.hash)

    newBlock.signature = signature
    newBlock.recovery = recovery

    // Broadcasting to the network
    muffin.net.broadcast('blocks', newBlock)

    // Storing in DB
    BackendAdapter.instance
      .useWorldState()
      .create('blocks', newBlock.hash, newBlock)

    console.log(
      chalk.green(
        `Emitted block ${newBlock.hash} of height ${newBlock.blockHeight}`
      )
    )
  }, 30000)

  return
}

export default { start }
