import BackendAdapter from '../adapters/BackendAdapter'
import { toFixedNumber } from '../common'
import Account from '../models/Account'
import Blockchain from '../models/Blockchain'
import { Meta } from '../models/State'

export default async function createMoney() {
  const { meta }: Blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  const { contract }: Account = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', '0x1')

  if (!contract) {
    throw Error("MuffinID contract doesn't have storage")
  }

  const { storage } = contract

  const idCount = meta.idCount
  const newIdCount = storage.supply

  if (newIdCount < idCount) {
    return
  }

  let newTotalSupply = meta.totalSupply

  const newIdealSupply = newIdCount * meta.idealSupplyPerAccount
  const moneyToCreate = newIdealSupply - meta.idealSupply

  // We have to distribute recently created money, but also undistributed money from before
  const moneyToDistribute =
    moneyToCreate + (meta.idealSupply - meta.totalSupply)

  const dividend = moneyToDistribute / newIdCount

  if (dividend > 0.01) {
    const finalDividend = toFixedNumber(dividend, 2)
    let distributedDividend = 0

    // Updating balances
    for (let tokenId of Object.keys(storage.owners)) {
      try {
        const account: Account = await BackendAdapter.instance
          .useWorldState()
          .read('accounts', storage.owners[tokenId])

        // Increasing balance
        account.add(finalDividend)

        // Updating in db
        await BackendAdapter.instance
          .useWorldState()
          .update('accounts', account.address, { balance: account.balance })

        distributedDividend += finalDividend
      } catch (e) {}
    }

    newTotalSupply += distributedDividend
  }

  const newMeta: Meta = {
    ...meta,
    totalSupply: newTotalSupply,
    idealSupply: newIdealSupply,
    idCount: newIdCount,
  }

  // Saving new metadata
  await BackendAdapter.instance
    .useWorldState()
    .update('blockchain', 'blockchain', {
      meta: newMeta,
    })
}
