import { b10toHex, calculateFees, toDecimal } from '../common'
import { floatToWei, weiToFloat } from '../ethereum'
import { AddressReference } from '../models/References'

export default function eth_estimateGas([{ from, value }]: [
  { from: AddressReference; value: AddressReference }
]) {
  const parsedValue = toDecimal(value)

  const floatValue = weiToFloat(parsedValue)

  const fees = calculateFees(floatValue, 0.01)

  const weiFees = floatToWei(fees)

  return b10toHex(weiFees)
}
