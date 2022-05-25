import BackendAdapter from './adapters/BackendAdapter'
import run from './console'
import getmac from 'getmac'
import hash from './common/hash'
import { Network, AnonymousAuth, Message } from 'ataraxia'
import { TCPTransport, TCPPeerMDNSDiscovery } from 'ataraxia-tcp'
import minimist from 'minimist'
import { Muffin } from './models/State'
import Transaction from './models/Transaction'

const argv = minimist(process.argv.slice(2))

const net = new Network({
  name: 'muffin',
  transports: [
    new TCPTransport({
      discovery: new TCPPeerMDNSDiscovery(),
      authentication: [new AnonymousAuth()],
    }),
  ],
})

/*swarm({
  id: hash(getmac()),
  utp: true,
  tcp: true,
})*/

/*net.onNodeAvailable((node) => {
  console.log('A new node is available:', node.id)
  node
    .send('hello', 'coucou')
    .catch((err) => console.log('Unable to send hello', err))
})*/

net.onMessage((msg: Message<any>) => {
  if (msg.type == 'transactions') {
    const tx = Transaction.instantiate(msg.data)

    BackendAdapter.instance.useWorldState().create(msg.type, tx.hash, tx)
  }
})

// Join the network
net.join()

const muffin: Muffin = { net }

new BackendAdapter(argv.storage)

run(muffin)
