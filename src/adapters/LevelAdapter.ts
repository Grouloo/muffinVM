import Level from 'level-ts'
import Sub from 'sublevel'
import BaseObject from '../models/BaseObject'
import Account from '../models/Account'
import Block from '../models/Block'
import Transaction from '../models/Transaction'
import { AddressReference } from '../models/References'
import { State } from '../models/State'
import Bond from '../models/Bond'
import Blockchain from '../models/Blockchain'

type collectionType =
  | 'accounts'
  | 'blocks'
  | 'transactions'
  | 'bonds'
  | 'blockchain'

const COLLECTIONS = {
  accounts: Account,
  blocks: Block,
  transactions: Transaction,
  bonds: Bond,
  blockchain: Blockchain,
}

const WORLDSTATE = '0x0'

export default class LevelAdapter {
  db: Level
  state: Level
  collections: {
    [x: string]: Level
  }
  static instance: LevelAdapter
  constructor(path: string) {
    this.db = new Level('./storage' /*path*/)

    this.useWorldState()

    LevelAdapter.instance = this
  }

  initializeState = (stateHash: AddressReference) => {
    this.state = new Level(Sub(this.db, stateHash))

    // Initializating all collections
    this.collections = {}
    Object.keys(COLLECTIONS).map((collection) => {
      this.collections[collection] = new Level(Sub(this.state, collection))
    })
  }

  useState = (stateHash: AddressReference): LevelAdapter => {
    this.initializeState(stateHash)

    return LevelAdapter.instance
  }

  useWorldState = () => {
    this.initializeState(WORLDSTATE)

    return LevelAdapter.instance
  }

  all = async () => {
    const response = await this.state.all()

    return response
  }

  create = async (
    collection: collectionType,
    key: string,
    value: BaseObject
  ) => {
    await this.collections[collection].put(key, value.toJSON())

    return value
  }

  read = async (collection: collectionType, key: string) => {
    const value = await this.collections[collection].get(key)

    return COLLECTIONS[collection].instantiate(value) as typeof value
  }

  update = async (
    collection: collectionType,
    key: string,
    value: BaseObject
  ) => {
    const oldValue = await this.read(collection, key)

    const newValue = Object.assign(oldValue, value.toJSON)

    await this.collections[collection].put(key, newValue)

    return COLLECTIONS[collection].instantiate(newValue)
  }

  delete = async (collection: collectionType, key: string) => {
    await this.collections[collection].del(key)
  }

  list = async (collection: collectionType) => {
    const value = await this.collections[collection].all()

    return value
  }

  getState = async () => {
    const currentState: State = {
      accounts: {},
      transactions: {},
      blocks: {},
      bonds: {},
      blockchain: {},
    }

    await Promise.all(
      Object.keys(COLLECTIONS).map(async (collection) => {
        currentState[collection as collectionType] = this.collection2object(
          await this.list(collection as collectionType),
          collection as collectionType
        )
      })
    )

    return currentState
  }

  protected collection2object = (arr: any[], collection: collectionType) => {
    return arr.reduce(
      (obj: any, item: any) => (
        (obj[item.hash] = COLLECTIONS[collection].instantiate(item)), obj
      ),
      {}
    )
  }
}
