import { msg } from '../interfaces/msg'

export class App {
  msg: msg = { sender: '0x' }

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
