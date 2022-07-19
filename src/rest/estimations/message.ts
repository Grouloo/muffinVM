import * as express from 'express'
import BackendAdapter from '../../adapters/BackendAdapter'
import { composeMessage } from '../../common'
import Account from '../../models/Account'

export default async (req: express.Request, res: express.Response) => {
  try {
    let { from, to, amount, fees, data } = req.body

    amount = parseFloat(amount)
    fees = parseFloat(fees)

    if (!data) {
      data = ''
    }

    const { nonce }: Account = await BackendAdapter.instance
      .useWorldState()
      .read('accounts', from)

    const message = await composeMessage({ nonce, to, amount, fees, data })

    return res.status(200).json({ message })
  } catch (e: any) {
    return res.status(500).json({ message: e.message })
  }
}
