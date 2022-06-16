import { b10toHex, toHex } from '../common'

/**
 * Generates a RLP
 * This is dumb spaghetti code and a dumb way for doing this
 * TODO: This is dumb.
 * @param firstValue
 * @param values
 * @param withLength
 * @returns
 */
export default function encodeRLP(values: any[], withLength: boolean = true) {
  /*let rlp =
    typeof firstValue == 'string'
      ? firstValue.slice(2)
      : b10toHex(firstValue).slice(2)

  if (rlp.length % 2 != 0) {
    rlp = `0${rlp}`
  }*/

  let rlp = ''

  values.map((value) => {
    let parsedValue
    if (typeof value == 'number') {
      if (value <= 0) {
        parsedValue = ''
      } else {
        parsedValue = b10toHex(value).slice(2)
      }
    } else {
      if (value.slice(0, 2) == '0x') {
        parsedValue = value.slice(2)
      } else {
        parsedValue = toHex(value).slice(2)
      }
    }

    let size = parsedValue.length / 2 + 128

    if (size == 128) {
      rlp += '80'
      return
    }

    if (size % 2 != 0) {
      parsedValue = `0${parsedValue}`
      size = parsedValue.length / 2 + 128
    }

    let parsedSize = b10toHex(size).slice(2)

    if (size == 129) {
      rlp += `${parsedValue}`
      return
    } else {
      rlp += `${parsedSize}${parsedValue}`
    }
  })

  if (withLength) {
    let payloadSize
    let prefix

    if (rlp.length / 2 < 55) {
      prefix = b10toHex(rlp.length / 2 + 192).slice(2)
      rlp = `0x${prefix}${rlp}`
    } else {
      payloadSize = b10toHex(rlp.length / 2).slice(2)
      prefix = b10toHex(payloadSize.length / 2 + 247).slice(2)
      rlp = `0x${prefix}${payloadSize}${rlp}`
    }
  } else {
    rlp = `0xec${rlp}`
  }

  return rlp
}
