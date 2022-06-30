import { calculateContractAddress, executeApp, hash } from '.'
import BackendAdapter from '../adapters/BackendAdapter'
import { encodeRLP } from '../ethereum'
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
  try {
    let blockchain = await BackendAdapter.instance
      .useWorldState()
      .read('blockchain', 'blockchain')

    let sender: Account = await BackendAdapter.instance
      .useWorldState()
      .read('accounts', transaction.from)

    let receiver: Account = await BackendAdapter.instance
      .useWorldState()
      .read('accounts', transaction.to || '')

    // If the receiver has no account yet, we have to create it
    if (!receiver && transaction.to != null) {
      receiver = Account.create(transaction.to)

      // Updating metadata
      blockchain.meta.eoaCount += 1

      // Not relevant anymore
      // We'll use Muffin IDs instead
      //blockchain.meta.idealSupply =
      //blockchain.meta.eoaCount * blockchain.meta.idealSupplyPerAccount

      // Saving blockchain meta in state
      await BackendAdapter.instance
        .useWorldState()
        .update('blockchain', 'blockchain', { meta: blockchain.meta })

      // Saving account in state
      await BackendAdapter.instance
        .useWorldState()
        .create('accounts', transaction.to, receiver)
    }

    const message = await composeMessage({
      to: transaction.to || null,
      amount: transaction.amount,
      fees: transaction.fees,
      nonce: sender.nonce,
      data: transaction.data,
    })

    if (
      !executeInternalTransactions &&
      (!transaction.signature || typeof transaction.recovery != 'number')
    ) {
      throw Error('Missing signature or recovery')
    }

    if (!executeInternalTransactions) {
      const { address } = verifySignature(
        transaction.signature as AddressReference,
        message,
        transaction.recovery as number
      )

      if (sender.isOwned && address != sender.address) {
        throw Error(`Bad signature. Got ${address}`)
      }
    }

    // If executeInternalTransactions is set on false,
    // there should be no transaction emanating from non-externally owned accounts
    if (!sender.isOwned && !executeInternalTransactions) {
      throw Error(
        'External transaction expected, but this is an internal transaction.'
      )
    }

    // If there is no receiving address specified, then we assume it is a contract registering tx
    if (!receiver.address || (receiver.address as string) == '') {
      const { environment, className, script } = JSON.parse(transaction.data)

      const size = script.length

      // Computing contract address
      const address: AddressReference = calculateContractAddress(
        sender.address,
        sender.nonce
      )

      // even it is unlikely, the generated address could aready be used by someone else
      // So, we have to check that there is no account linked to it
      const account = await BackendAdapter.instance
        .useWorldState()
        .read('accounts', address)

      if (account) {
        // Updating sender's nonce
        sender.nonce += 1

        //Saving sender account
        await BackendAdapter.instance
          .useWorldState()
          .update('accounts', sender.address, sender)

        throw Error('The generated address is already used. Please try again.')
      }

      // Updating sender's nonce
      sender.nonce += 1

      sender.withdraw(transaction.total)

      // Creating contract
      const contractAccount = Account.instantiate({
        address,
        nonce: 0,
        isOwned: false,
        balance: transaction.amount,
        contract: { size, environment, className, script, storage: {} },
      })

      //Saving sender account
      await BackendAdapter.instance
        .useWorldState()
        .update('accounts', sender.address, sender)

      // Saving contract account
      await BackendAdapter.instance
        .useWorldState()
        .create('accounts', contractAccount.address, contractAccount)
    }

    // If the receiving account isn't owned, it is a contract
    else if (!receiver.isOwned) {
      sender.withdraw(transaction.total)
      receiver.add(transaction.amount)

      if (!transaction.data) {
        throw Error("Missing data. Must be '[methodName](arg1, arg2, ...)'")
      }
      const [method, params] = transaction.data.split(/[()]/)

      if (!params) {
        throw Error("Bad data. Must be '[methodName](arg1, arg2, ...)'")
      }
      const args = params // params.split(',')

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

        // Updating sender's nonce
        sender.nonce += 1

        // Saving edited accounts
        await BackendAdapter.instance
          .useWorldState()
          .update('accounts', sender.address, sender)

        // Saving new storage content
        await BackendAdapter.instance
          .useWorldState()
          .update('accounts', receiver.address, {
            balance: receiver.balance,
            contract,
          })

        return internalTransactions.filter(function (element) {
          return element !== undefined
        }) as Transaction[]
      } catch (e) {
        throw Error(`Internal App Error.\n ${(e as Error).message}`)
      }
    } else {
      try {
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
      } catch (e) {
        throw e as Error
      }
    }

    return
  } catch (e) {
    throw e as Error
  }
}
