import * as secp from '@noble/secp256k1'
import { calculateFees, toDecimal, verifySignature } from '../common'
import { weiToFloat } from '../ethereum'
import { decodeRLP, encodeRLP } from '../ethereum'
import hash from '../common/hash'
import Muffin from '../models/Muffin'
import { AddressReference } from '../models/References'
import Transaction from '../models/Transaction'
import Blockchain from '../models/Blockchain'
import BackendAdapter from '../adapters/BackendAdapter'

export default async function eth_sendRawTransaction([rawData]: [
  AddressReference
]) {
  try {
    const { meta }: Blockchain = await BackendAdapter.instance
      .useWorldState()
      .read('blockchain', 'blockchain')

    let [prefix, payload] = rawData.split(/f8(.*)/s)

    payload = payload.substring(2)

    // Getting nonce
    let { value: nonce, ...afterNonce } = decodeRLP(payload, 'number')
    payload = afterNonce.payload

    // Fees
    let { value: fees, ...afterFees } = decodeRLP(payload, 'number')
    payload = afterFees.payload
    //fees = 0

    // Gas limit
    let { value: gas, ...afterGas } = decodeRLP(payload, 'number')
    payload = afterGas.payload

    // To
    let { value: to, ...afterTo } = decodeRLP(payload)
    payload = afterTo.payload

    // Amount
    let { value, ...afterAmount } = decodeRLP(payload, 'number')
    let amount = weiToFloat(value as number)
    payload = afterAmount.payload

    // Data
    let { value: data, ...afterData } = decodeRLP(payload)
    payload = afterData.payload

    // v value
    let { value: v, ...afterV } = decodeRLP(payload)
    payload = afterV.payload

    const recovery = toDecimal(v as AddressReference) - (1984 * 2 + 35)

    // r value
    let { value: r, ...afterR } = decodeRLP(payload)
    payload = afterR.payload

    // s value
    let { value: s, ...afterS } = decodeRLP(payload)
    payload = afterS.payload

    const signature = `0x${new secp.Signature(
      BigInt(r as string),
      BigInt(s as string)
    ).toCompactHex()}` // generateRPL(v as string, [r, s], false)

    // Recreate message
    const message = encodeRLP([nonce, fees, gas, to, value, data, 1984, '', ''])

    const hashedMessage = hash(Buffer.from(message.slice(2), 'hex'))

    // Get sender from message hash and signature
    const { address: from } = verifySignature(
      signature as AddressReference,
      hashedMessage,
      recovery
    )

    // const total = amount + calculateFees(amount, meta.taxRate)

    // Generating transaction
    const transaction = await Transaction.generate(
      from,
      to as AddressReference,
      amount,
      data as string,
      signature as AddressReference,
      recovery,
      Muffin.instance,
      new Date()
    )

    /* console.log({
      nonce,
      fees,
      to,
      amount,
      gas,
      data,
      v,
      r,
      s,
      signature,
      message,
      hashedMessage,
      recovery,
      from: verifySignature(
        signature as AddressReference,
        hashedMessage,
        recovery
      ).address,
    }) */

    return transaction.hash
  } catch (e) {
    console.log(e)
    return '0x0'
  }
}
