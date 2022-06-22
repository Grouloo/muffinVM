import BackendAdapter from '../adapters/BackendAdapter'
import { b10toHex, calculateFees, toDecimal } from '../common'
import { floatToWei, weiToFloat } from '../ethereum'
import Blockchain from '../models/Blockchain'
import { AddressReference } from '../models/References'

export default async function eth_estimateGas([{ from, value }]: [
  { from: AddressReference; value: AddressReference }
]) {
  const { meta }: Blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  const parsedValue = toDecimal(value)

  const floatValue = weiToFloat(parsedValue)

  const fees = calculateFees(floatValue, meta.taxRate)

  const weiFees = floatToWei(fees)

  return b10toHex(weiFees)
}
