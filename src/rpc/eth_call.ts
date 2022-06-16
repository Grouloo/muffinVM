import { executeApp } from '../common'
import { weiToFloat } from '../ethereum'
import { AddressReference } from '../models/References'

export default async function eth_call([{ from, to, value }]: [
  { from: AddressReference; to: AddressReference; value: AddressReference }
]) {
  //executeApp(from, to, weiToFloat(value), )

  return '0x0'
}
