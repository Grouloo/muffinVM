import chalk from 'chalk'
import inquirer from 'inquirer'
import BackendAdapter from '../../adapters/BackendAdapter'
import createBlockchain from '../../common/createBlockchain'

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
    entries.receiverAddress
  )

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

export default { init, meta, latestBlock }
