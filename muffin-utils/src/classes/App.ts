import { address } from '..'
import { msg } from '../interfaces/msg'

export class App {
  msg: msg = {
    sender: '0x',
    amount: 0,
    makeTransaction: (to: address, total: number) => undefined,
  }

  constructor(data: any) {
    Object.assign(this, data)
  }

  _toJSON = () => {
    const { msg, ...props } = this

    const stringified = JSON.stringify(props)

    const parsed = JSON.parse(stringified)

    return parsed
  }
}
