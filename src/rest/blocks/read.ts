import * as express from 'express'
import BackendAdapter from '../../adapters/BackendAdapter'
import Block from '../../models/Block'

export default async (req: express.Request, res: express.Response) => {
  try {
    const { hash } = req.params

    const block: Block = await BackendAdapter.instance
      .useWorldState()
      .read('blocks', hash)

    if (!block) {
      return res.status(404).send({ message: 'Not found.' })
    }

    res.status(200).json(block._toJSON())
  } catch (e: any) {
    return res.status(500).json({ message: e.message })
  }
}
