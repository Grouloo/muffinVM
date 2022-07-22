import * as express from 'express'
import BackendAdapter from '../../adapters/BackendAdapter'

export default async (req: express.Request, res: express.Response) => {
  try {
    const blocks = await BackendAdapter.instance
      .useWorldState()
      .find('blocks', 'status', 'accepted', 'desc')

    res.status(200).json(blocks)
  } catch (e: any) {
    return res.status(500).json({ message: e.message })
  }
}
