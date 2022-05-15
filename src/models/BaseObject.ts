export default class BaseObject {
  constructor(data: any) {
    Object.assign(this, data)
  }

  static instantiate = (data: any) => {
    return new this(data)
  }

  toJSON = () => {
    const { ...object } = this

    return object
  }
}
