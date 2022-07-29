import { Network } from 'ataraxia'
import { Services } from 'ataraxia-services'

export interface MuffinInterface {
  net: Network<any>
  services: Services
  awaitingMysteryBox?: string
}

export default class Muffin implements MuffinInterface {
  net: Network<any>
  services: Services
  awaitingMysteryBox?: string

  static instance: Muffin

  constructor(data: MuffinInterface) {
    this.net = data.net
    this.services = data.services

    Muffin.instance = this
  }
}
