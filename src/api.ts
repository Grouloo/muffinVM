import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import launchRest from './rest'
import launchRPC from './rpc'

import config from '../config.json'

export default function launchApi(port: any) {
  const app = express()

  app.use(cors())
  app.use(bodyParser.json())
  /*app.use((req, res, next) => {
    if (req.body.method != 'eth_blockNumber')
      console.log(`${req.url}: ${JSON.stringify(req.body)}`)
    next()
  })*/

  if (config.services.rest) {
    launchRest(app)
  }

  if (config.services.rpc) {
    launchRPC(app)
  }

  app.listen(port || 8545)
}
