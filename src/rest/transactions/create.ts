import * as express from 'express'
import BackendAdapter from '../../adapters/BackendAdapter'
import { composeMessage } from '../../common'
import Muffin from '../../models/Muffin'
import Transaction from '../../models/Transaction'

export default async (req: express.Request, res: express.Response) => {
  try {
    let { from, to, amount, data, signature, recovery } = req.body

    amount = parseFloat(amount)

    if (!data) {
      data = ''
    }

    const transaction = await Transaction.generate(
      from,
      to,
      amount,
      data,
      signature,
      recovery,
      Muffin.instance,
      new Date()
    )

    return res.status(201).json(transaction)
  } catch (e: any) {
    return res.status(500).json({ message: e.message })
  }
}
