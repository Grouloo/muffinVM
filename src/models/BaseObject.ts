export default class BaseObject {
  constructor(data: any) {
    Object.assign(this, data)
  }

  static instantiate = (data: any) => {
    return new this(data)
  }

  _toJSON = () => {
    const { ...object } = this

    const stringified = JSON.stringify(object)

    const parsed = JSON.parse(stringified)

    return parsed
  }
}
