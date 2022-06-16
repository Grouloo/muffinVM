import inquirer from 'inquirer'
import BackendAdapter from '../../adapters/BackendAdapter'

async function read() {
  const entries = await inquirer.prompt([
    {
      name: 'blockHash',
      type: 'INPUT',
      message: 'Block hash:',
    },
  ])

  const block = await BackendAdapter.instance
    .useWorldState()
    .read('blocks', entries.blockHash)

  console.log(block._toJSON())

  return
}

async function accepted() {
  const blocks = await BackendAdapter.instance
    .useWorldState()
    .find('blocks', 'status', 'accepted', 'asc')

  console.log(blocks)

  return
}

async function pending() {
  const blocks = await BackendAdapter.instance
    .useWorldState()
    .find('blocks', 'status', 'pending', 'asc')

  console.log(blocks)

  return
}

async function refused() {
  const blocks = await BackendAdapter.instance
    .useWorldState()
    .find('blocks', 'status', 'refused', 'asc')

  console.log(blocks)

  return
}

async function lastRefused() {
  const blocks = await BackendAdapter.instance
    .useWorldState()
    .find('blocks', 'status', 'refused', 'desc')

  console.log(blocks[0])

  return
}

export default { read, accepted, pending, refused, lastRefused }
