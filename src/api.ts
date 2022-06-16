import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import launchRPC from './rpc'

export default function launchApi(port: any) {
  const app = express()

  app.use(cors())
  app.use(bodyParser.json())
  /*app.use((req, res, next) => {
    if (req.body.method != 'eth_blockNumber')
      console.log(`${req.url}: ${JSON.stringify(req.body)}`)
    next()
  })*/

  launchRPC(app)

  app.listen(port || 8545)
}
