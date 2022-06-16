import { JSONRPCServer } from 'json-rpc-2.0'
import { Express } from 'express'
import * as rpcMethods from './rpc/index'

export default function launchRPC(app: Express) {
  const server = new JSONRPCServer()

  app.post('/rpc', async (req, res) => {
    // Starting methods
    for (let method of Object.keys(rpcMethods)) {
      server.addMethod(method, (rpcMethods as any)[method])
    }

    const jsonRPCRequest = req.body

    const jsonRPCResponse = await server.receive(jsonRPCRequest)

    /* if (req.body.method != 'eth_blockNumber')
      console.log(jsonRPCResponse?.result) */

    if (jsonRPCResponse) {
      res.json(jsonRPCResponse)
    } else {
      res.sendStatus(204)
    }
  })
}
