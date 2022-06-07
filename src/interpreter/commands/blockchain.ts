import chalk from 'chalk'
import inquirer from 'inquirer'
import BackendAdapter from '../../adapters/BackendAdapter'
import { createAccount, signMessage } from '../../common'
import createBlockchain from '../../common/createBlockchain'
import syncBlockchain from '../../common/syncBlockchain'
import Block from '../../models/Block'
import { AddressReference } from '../../models/References'
import { Muffin } from '../../models/State'

async function init(path: string) {
  const entries = await inquirer.prompt([
    {
      name: 'chainId',
      type: 'INPUT',
      message: 'Chain Id:',
    },
    {
      name: 'receiverAddress',
      type: 'INPUT',
      message: 'Receiving address:',
    },
  ])

  const blockchain = await createBlockchain(
    entries.chainId,
    entries.receiverAddress,
    ''
  )

  console.log(blockchain)

  console.log(chalk.green('Blockchain initialized.'))

  return
}

async function snap(muffin: Muffin) {
  const entries = await inquirer.prompt([
    {
      name: 'privateKey',
      type: 'INPUT',
      message: 'private key:',
    },
  ])

  const { privateKey } = entries

  const { address } = createAccount(privateKey)

  const block = await Block.generate(address as AddressReference)

  const { signature, recovery } = await signMessage(
    privateKey as AddressReference,
    block.hash
  )

  block.signature = signature
  block.recovery = recovery

  console.log(block._toJSON())

  await muffin.net.broadcast('blocks', block._toJSON())

  console.log(chalk.green('Blockchain snapped.'))

  return
}

async function sync() {
  const entries = await inquirer.prompt([
    {
      name: 'node',
      type: 'INPUT',
      message: 'Other node address:',
    },
  ])

  const blockchain = await syncBlockchain(entries.receiverAddress)

  console.log(blockchain)

  console.log(chalk.green('Blockchain initialized.'))

  return
}

async function meta() {
  const { meta } = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  return console.log(meta)
}

async function latestBlock() {
  const { currentBlockHash } = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  const block = await BackendAdapter.instance
    .useWorldState()
    .read('blocks', currentBlockHash)

  return console.log(block)
}

export default { init, snap, meta, latestBlock }
