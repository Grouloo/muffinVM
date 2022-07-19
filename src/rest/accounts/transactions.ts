import * as express from 'express'
import BackendAdapter from '../../adapters/BackendAdapter'
import Account from '../../models/Account'

export default async (req: express.Request, res: express.Response) => {
  const { address } = req.params

  const transactions = await BackendAdapter.instance.sort(
    [
      ...(await BackendAdapter.instance
        .useWorldState()
        .find('transactions', 'from', address, 'desc')),
      ...(await BackendAdapter.instance
        .useWorldState()
        .find('transactions', 'to', address, 'desc')),
    ],
    'desc'
  )

  res.status(200).json(transactions)
}
