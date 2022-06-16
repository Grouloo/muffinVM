import { AddressReference } from '../models/References'
import BackendAdapter from '../adapters/BackendAdapter'
import { floatToWei } from '../ethereum'
import { b10toHex } from '../common'

export default async function eth_getTransactionReceipt([hash]: [
  AddressReference
]) {
  const transaction = await BackendAdapter.instance
    .useWorldState()
    .read('transactions', hash)

  const response = {
    blockHash: '0x0',
    blockNumber: '0x0',
    contractAddress: null,
    from: transaction.from,
    to: transaction.to,
    cumulativeGasUsed: '0x0',
    gasUsed: b10toHex(floatToWei(transaction.fees)),
    logs: [],
    logsBloom:
      '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    status: transaction.status == 'done' ? '0x1' : '0x0',
    transactionHash: transaction.hash,
    transactionIndex: '0x0',
  }

  return response
}
