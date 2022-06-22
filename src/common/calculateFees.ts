export default function calculateFees(
  amount: number,
  rate: number,
  script?: string
): number {
  // If the transaction is deploying a contract
  // The fees are linked to the size of the contract
  if (script) {
    const fees = script.length * rate * 0.1

    if (fees < rate) {
      return rate
    }

    return toFixedNumber(fees, 3)
  }

  if (amount < 1) {
    return rate
  }

  const fees = amount * rate

  return toFixedNumber(fees, 3)
}

function toFixedNumber(num: number, digits: number) {
  var pow = Math.pow(10, digits)
  return Math.round(num * pow) / pow
}
