import BackendAdapter from '../adapters/BackendAdapter'
import { signMessage, delay } from '../common'
import Account from '../models/Account'
import Block from '../models/Block'
import { AddressReference } from '../models/References'
import Muffin from '../models/Muffin'
import isExpectedValidator from './isExpectedValidator'
import updateStakes from './updateStakes'

export default async function processBlock(
  block: Block,
  me: any,
  muffin: Muffin,
  syncing: boolean = false
) {
  await BackendAdapter.instance
    .useWorldState()
    .create('blocks', block.hash, block)

  const { contract }: Account = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', '0x0')

  if (!contract) {
    return
  }

  const { stakes } = contract.storage

  const expectedValidator = await isExpectedValidator(block)

  if (!expectedValidator) {
    return
  }

  const { currentBlockHash, meta } = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  const isValid = await block.confirm(currentBlockHash)

  // Updating stakes and finding next validator
  const nextValidator = await updateStakes(block.validatedBy, isValid)

  // If the node is chosen as validator
  // We create and send a block
  if (me.address == nextValidator && !syncing) {
    // Processing empty blocks is considered as bad practice on muffin
    // So, we check every 10s if there are pending transactions
    while (true) {
      const transactions = await BackendAdapter.instance
        .useWorldState()
        .find('transactions', 'status', 'pending')

      if (transactions.length > 0) {
        break
      }

      await delay(10000)
    }

    const newBlock = await Block.generate(me.address as AddressReference)

    const { signature, recovery } = await signMessage(
      me.privateKey as AddressReference,
      newBlock.hash
    )

    newBlock.signature = signature
    newBlock.recovery = recovery

    // Broadcasting to the network
    muffin.net.broadcast('blocks', newBlock._toJSON())

    // Storing in DB
    await BackendAdapter.instance
      .useWorldState()
      .create('blocks', newBlock.hash, newBlock)

    // Processing our own block
    await processBlock(newBlock, me, muffin)
  }
}
