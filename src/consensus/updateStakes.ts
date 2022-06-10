import Account from '../models/Account'
import BackendAdapter from '../adapters/BackendAdapter'
import Block from '../models/Block'
import { AddressReference } from '../models/References'

export default async function updateStakes(
  validatedBy: AddressReference,
  isValid: boolean
) {
  const { contract }: Account = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', '0x0')

  if (!contract) {
    throw '0x0 storage not found! Try resetting your storage!'
  }

  // Punishing the validator if needed
  if (!isValid) {
    if (contract.storage.balances[validatedBy] > 0) {
      contract.storage.balances[validatedBy] -= 1
      contract.storage.tokenTotalSupply -= 1
    }
  }

  // Resetting validator blocks count
  contract.storage.blocks[validatedBy] = 0

  // Updating validator's stake
  contract.storage.stakes[validatedBy] = 0

  // Updating everyone's stake
  Object.keys(contract.storage.blocks).map((owner: any) => {
    if (owner == validatedBy) {
      return
    }

    const passedBlocks = contract.storage.blocks[owner] + 1
    contract.storage.blocks[owner] = passedBlocks

    contract.storage.stakes[owner] =
      passedBlocks * contract.storage.balances[owner]
  })

  // Updating contract storage
  await BackendAdapter.instance
    .useWorldState()
    .update('accounts', '0x0', { contract })

  // If the registered address is chosen, we submit a block
  const nextValidator = Object.keys(contract.storage.stakes).reduce((a, b) =>
    contract.storage.stakes[a] > contract.storage.stakes[b] ? a : b
  )

  return nextValidator
}
