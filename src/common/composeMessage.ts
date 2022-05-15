export default function composeMessage(
  amount: number,
  nonce: number,
  data: string
): string {
  const message: string = amount.toString() + nonce.toString() + data

  return message
}
