import toDecimal from '../common/toDecimal'

/**
 * Takes RLP payload as arg and returns the next value, its size, and the rest of the payload
 * @param payload
 * @param convert
 * @returns
 */
export default function decodeRLP(payload: string, convert?: 'number') {
  const rawSize = payload.substring(0, 2)
  let size = (toDecimal(`0x${rawSize}`) - 128) * 2

  if (size == 0) {
    return {
      size: 0,
      value: convert == 'number' ? 0 : '',
      payload: payload.substring(2),
    }
  }

  let rawValue
  if (size < 0) {
    rawValue = payload.substring(0, 2)
    size = 0
  } else {
    rawValue = payload.substring(2, size + 2)
  }

  let value
  if (!convert) {
    value = `0x${rawValue}`
  } else if (convert == 'number') {
    value = toDecimal(`0x${rawValue}`)
  }

  payload = payload.substring(2 + size)

  return { size, value, payload }
}
