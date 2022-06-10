import chalk from 'chalk'
import inquirer from 'inquirer'
import BackendAdapter from '../../adapters/BackendAdapter'
import { createAccount, signMessage } from '../../common'
import createBlockchain from '../../common/createBlockchain'
import syncBlockchain from '../../common/syncBlockchain'
import Block from '../../models/Block'
import { AddressReference } from '../../models/References'
import { Muffin } from '../../models/State'

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
