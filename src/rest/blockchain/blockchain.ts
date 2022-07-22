import * as express from 'express'
import BackendAdapter from '../../adapters/BackendAdapter'

export default async (req: express.Request, res: express.Response) => {
  try {
    const blockchain = await BackendAdapter.instance
      .useWorldState()
      .read('blockchain', 'blockchain')

    res.status(200).json(blockchain)
  } catch (e: any) {
    res.status(500).json({ message: e.message })
  }
}
