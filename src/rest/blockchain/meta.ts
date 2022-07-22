import * as express from 'express'
import BackendAdapter from '../../adapters/BackendAdapter'
import { executeApp } from '../../common'
import { AddressReference } from '../../models/References'

export default async (req: express.Request, res: express.Response) => {
  try {
    const { meta } = await BackendAdapter.instance
      .useWorldState()
      .read('blockchain', 'blockchain')

    res.status(200).json(meta)
  } catch (e: any) {
    res.status(500).json({ message: e.message })
  }
}
