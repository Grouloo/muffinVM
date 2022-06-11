export default function calculateFees(amount: number, rate: number) {
  if (amount < 1) {
    return 0.01
  }

  const fees = amount * rate

  return fees
}
