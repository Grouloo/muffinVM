import chalk from 'chalk'
import inquirer from 'inquirer'
import BackendAdapter from '../../adapters/BackendAdapter'
import { createAccount, signMessage } from '../../common'
import Block from '../../models/Block'
import Blockchain from '../../models/Blockchain'
import { AddressReference } from '../../models/References'
import Muffin from '../../models/Muffin'

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

async function sync(muffin: Muffin) {
  // Syncing VM
  let { currentBlockHash, meta }: Blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  console.log(chalk.yellow('Synchronizing...'))

  await muffin.net.broadcast('syncRequest', meta.blocksCount - 1)

  console.log(chalk.green('Blockchain synchronized.'))

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

export default { snap, sync, meta, latestBlock }
