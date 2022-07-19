import * as express from 'express'
import BackendAdapter from '../../adapters/BackendAdapter'
import { calculateFees } from '../../common'
import Blockchain from '../../models/Blockchain'

export default async (req: express.Request, res: express.Response) => {
  try {
    let { amount, script } = req.body

    amount = parseFloat(amount)

    const { meta }: Blockchain = await BackendAdapter.instance
      .useWorldState()
      .read('blockchain', 'blockchain')

    const { taxRate } = meta

    const fees = calculateFees(amount, taxRate, script)
    const total = amount + fees

    return res.status(200).json({ fees, total })
  } catch (e: any) {
    return res.status(500).json({ message: (e as Error).message })
  }
}
