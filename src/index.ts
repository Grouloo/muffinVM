import BackendAdapter from './adapters/BackendAdapter'
import run from './console'
import getmac from 'getmac'
import hash from './common/hash'
import { Network, AnonymousAuth, Message } from 'ataraxia'
import { TCPTransport, TCPPeerMDNSDiscovery } from 'ataraxia-tcp'
import minimist from 'minimist'
import { Muffin } from './models/State'
import Transaction from './models/Transaction'
import { createBlockchain } from './common'
import genesis from './genesis.json'
import { AddressReference } from './models/References'
import chalk from 'chalk'
import Blockchain from './models/Blockchain'

const argv = minimist(process.argv.slice(2))

const booting = async () => {
  console.log(chalk.yellow('Loading...'))

  const chainId = await setup()

  console.log(chalk.yellow(`Connecting to network ${chainId}...`))

  const net = connect(chainId)

  console.log(chalk.green('Ready to go!'))

  net.onMessage((msg: Message<any>) => {
    if (msg.type == 'transactions') {
      const tx = Transaction.instantiate(msg.data)

      if (tx.status != 'pending') {
        return
      }

      BackendAdapter.instance.useWorldState().create(msg.type, tx.hash, tx)
    }
  })

  // Join the network
  net.join()

  const muffin: Muffin = { net }

  run(muffin)
}

// Booting
const setup = async () => {
  new BackendAdapter(argv.storage)

  try {
    let blockchain: Blockchain = await BackendAdapter.instance
      .useWorldState()
      .read('blockchain', 'blockchain')

    if (!blockchain) {
      blockchain = await createBlockchain(
        genesis.chainId,
        genesis.receiverAddress as AddressReference,
        genesis.stackScript
      )

      console.log(chalk.green('Genesis block created.'))
    }

    return blockchain.meta.chainId
  } catch (e) {
    const blockchain = await createBlockchain(
      genesis.chainId,
      genesis.receiverAddress as AddressReference,
      genesis.stackScript
    )

    console.log(chalk.green('Genesis block created.'))

    return blockchain.meta.chainId
  }
}

const connect = (chainId: number) => {
  const net = new Network({
    name: `muffin${chainId}`,
    transports: [
      new TCPTransport({
        discovery: new TCPPeerMDNSDiscovery(),
        authentication: [new AnonymousAuth()],
      }),
    ],
  })

  return net
}

booting()
