import * as express from 'express'
import BackendAdapter from '../../adapters/BackendAdapter'
import { executeApp } from '../../common'
import { AddressReference } from '../../models/References'

export default async (req: express.Request, res: express.Response) => {
  try {
    const { address, method } = req.params
    const { args } = req.query

    const { res: response } = await executeApp(
      '0x',
      address as AddressReference,
      0,
      method,
      args as string
    )

    res.status(200).json({ address, timestamp: new Date(), res: response })
  } catch (e: any) {
    res.status(500).json({ message: e.message })
  }
}
