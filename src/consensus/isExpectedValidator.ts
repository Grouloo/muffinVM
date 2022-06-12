import BackendAdapter from '../adapters/BackendAdapter'
import Account from '../models/Account'
import Block from '../models/Block'
import { AddressReference } from '../models/References'
import updateStakes from './updateStakes'

/**
 * This function returns true if the current expected validator is late.
 * For a validator to be considered late, 2 conditions must be verified:
 * - The latest block must have been accepted for 30s or more
 * - There are pending transactions that need to be processed
 * @param previousBlockDate
 * @param currentBlockDate
 * @returns
 */
async function isExpectedValidatorLate(
  previousBlockDate: Date,
  currentBlockDate: Date,
  iteration: number
): Promise<boolean> {
  // console.log(iteration)

  if (currentBlockDate > new Date()) {
    return false
  }

  if (
    (currentBlockDate.getTime() - previousBlockDate.getTime()) / 1000 <
    30 * iteration - 5
  ) {
    return false
  }

  const pendingTxs = await BackendAdapter.instance
    .useWorldState()
    .find('transactions', 'status', 'pending', 'asc')

  if (pendingTxs.length == 0) {
    return false
  }

  // If the oldest transaction was made after this iteration's timeframe
  // the validator isn't considered late
  // NOTE: We add a 5s tolerance
  if (
    pendingTxs[0] &&
    new Date(pendingTxs[0].timestamp) >
      new Date(
        previousBlockDate.setSeconds(
          previousBlockDate.getSeconds() + (30 * iteration - 5)
        )
      )
  ) {
    return false
  }

  return true
}

/**
 * Return true if the validator of the pending block is the expected validator.
 * This function takes delays into account and is the main reference to avoid
 * the network being stuck.
 * @param block
 * @returns {boolean}
 */
export default async function isExpectedValidator(
  block: Block
): Promise<boolean> {
  const { contract }: Account = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', '0x0')

  if (!contract) {
    throw Error('0x0 storage not found! Try resetting your storage!')
  }

  const previousBlock: Block = await BackendAdapter.instance
    .useWorldState()
    .read('blocks', block.parentHash)

  const { stakes } = contract.storage

  // The expected validator is the one with the higher stake
  let expectedValidator = Object.keys(stakes).reduce((a, b) =>
    stakes[a] > stakes[b] ? a : b
  )

  // If the expected validator didn't send a block within 30s,
  // then the next in line can take its place
  const previousBlockDate = new Date(previousBlock.timestamp)
  const currentBlockDate = new Date(block.timestamp)

  let iteration = 1
  while (
    await isExpectedValidatorLate(
      previousBlockDate,
      currentBlockDate,
      iteration
    )
  ) {
    // If the designated validator doesn't send a block within 30s
    // and that they are pending transactions awaiting validation,
    // then, we reset his block counter and punish him.
    expectedValidator = await updateStakes(
      expectedValidator as AddressReference,
      false
    )

    iteration++
  }

  if (block.validatedBy !== expectedValidator) {
    return false
  }

  return true
}
