import * as express from 'express'
import BackendAdapter from '../../adapters/BackendAdapter'
import Account from '../../models/Account'

export default async (req: express.Request, res: express.Response) => {
  try {
    const { address } = req.params

    const account: Account = await BackendAdapter.instance
      .useWorldState()
      .read('accounts', address)

    if (!account) {
      return res.status(200).send({ nonce: 0, balance: 0 })
    }

    res.status(200).json(account._toJSON())
  } catch (e: any) {
    return res.status(500).json({ message: e.message })
  }
}
