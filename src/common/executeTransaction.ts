import BackendAdapter from '../adapters/BackendAdapter'
import Account from '../models/Account'
import { AddressReference } from '../models/References'
import { State } from '../models/State'
import Transaction from '../models/Transaction'
import composeMessage from './composeMessage'
import toUint8Array from './toUint8Array'
import verifySignature from './verifySignature'

export default async function executeTransaction(
  transaction: Transaction,
  previousStateHash: AddressReference,
  order: number
): Promise<void> {
  let blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  let sender = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', transaction.from)

  let receiver = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', transaction.to)

  // If the receiver has no account yet, we have to create it
  if (!receiver) {
    receiver = Account.create(transaction.to)

    // Updating metadata
    blockchain.meta.eoaCount += 1
    blockchain.meta.idealSupply =
      blockchain.meta.eoaCount * blockchain.meta.idealSupplyPerAccount

    // Saving account in state
    await BackendAdapter.instance
      .useWorldState()
      .create('accounts', transaction.to, receiver)
  }

  const message = composeMessage(
    transaction.amount,
    sender.nonce,
    transaction.data
  )

  const verifiedSignature = verifySignature(
    transaction.signature,
    message,
    transaction.recovery
  )

  if (!verifiedSignature) {
    throw "The signature doesn't fit the sender."
  }

  if (receiver.isContract) {
  } else {
    sender.withdraw(transaction.total)
    receiver.add(transaction.amount)

    // Updating sender's nonce
    sender.nonce += 1

    // Saving edited accounts
    await BackendAdapter.instance
      .useWorldState()
      .update('accounts', sender.address, sender)
    await BackendAdapter.instance
      .useWorldState()
      .update('accounts', sender.receiver, receiver)
  }

  return
}
