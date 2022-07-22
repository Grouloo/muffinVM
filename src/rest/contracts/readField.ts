import * as express from 'express'
import Account from '../../models/Account'
import BackendAdapter from '../../adapters/BackendAdapter'

export default async (req: express.Request, res: express.Response) => {
  try {
    const { address, field } = req.params

    const { contract }: Account = await BackendAdapter.instance
      .useWorldState()
      .read('accounts', address)

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found.' })
    }

    const { storage } = contract

    res.status(200).json({ [field]: storage[field] })
  } catch (e: any) {
    res.status(500).json({ message: e.message })
  }
}
