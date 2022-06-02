import { executeApp } from '.'
import BackendAdapter from '../adapters/BackendAdapter'
import Account from '../models/Account'
import { AddressReference } from '../models/References'
import Transaction from '../models/Transaction'
import composeMessage from './composeMessage'
import verifySignature from './verifySignature'

export default async function executeTransaction(
  transaction: Transaction,
  previousStateHash: AddressReference,
  order: number,
  executeInternalTransactions: boolean
): Promise<Transaction[] | undefined> {
  let blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  let sender: Account = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', transaction.from)

  let receiver: Account = await BackendAdapter.instance
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

  if (sender.isOwned && (!transaction.signature || !transaction.recovery)) {
    throw 'Missing signature or recovery'
  }

  const { address } = verifySignature(
    transaction.signature as AddressReference,
    message,
    transaction.recovery as number
  )

  if (sender.isOwned && address != sender.address) {
    throw 'Bad signature.'
  }

  // If executeInternalTransactions is set on false,
  // there should be no transaction emanating from non-externally owned accounts
  if (!sender.isOwned && !executeInternalTransactions) {
    throw 'External transaction expected, but this is an internal transaction.'
  }

  if (!receiver.isOwned) {
    sender.withdraw(transaction.total)
    receiver.add(transaction.amount)

    const [method, params] = transaction.data.split('(')

    const args = params.split(',')

    try {
      const { storage, tx } = await executeApp(
        sender.address,
        receiver.address,
        transaction.amount,
        method,
        args
      )

      // Getting contract's data
      const { contract }: Account = await BackendAdapter.instance
        .useWorldState()
        .read('accounts', receiver.address)

      if (!contract) {
        throw 'Not an app.'
      }

      // Executing all internal transactions emitted during runtime
      const internalTransactions = await Promise.all(
        tx.map(async (internalTransaction: Transaction) => {
          const subTx = await executeTransaction(
            internalTransaction,
            previousStateHash,
            0,
            true
          )

          if (!subTx) {
            return
          }

          internalTransaction.internalTransactions = subTx.filter(function (
            element
          ) {
            return element !== undefined
          })

          return internalTransaction
        })
      )

      contract.storage = storage

      // Saving new storage content
      await BackendAdapter.instance
        .useWorldState()
        .update('accounts', receiver.address, { contract })

      return internalTransactions.filter(function (element) {
        return element !== undefined
      }) as Transaction[]
    } catch (e) {
      throw 'Internal App Error.'
    }
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
      .update('accounts', receiver.address, receiver)
  }

  return
}
