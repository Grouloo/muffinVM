import { AddressReference } from '../models/References'

export default function hextoString(hex: AddressReference) {
  var str = ''
  for (var i = 0; i < hex.length; i += 2) {
    var v = parseInt(hex.substr(i, 2), 16)
    if (v) str += String.fromCharCode(v)
  }
  return str
}
