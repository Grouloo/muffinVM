import BackendAdapter from './adapters/BackendAdapter'
import run from './console'
import { Network, AnonymousAuth, Message, Node } from 'ataraxia'
import { TCPTransport, TCPPeerMDNSDiscovery } from 'ataraxia-tcp'
import { Services } from 'ataraxia-services'
import minimist from 'minimist'
import Muffin from './models/Muffin'
import Transaction from './models/Transaction'
import { createBlockchain, hash } from './common'
import chalk from 'chalk'
import Blockchain from './models/Blockchain'
import Block from './models/Block'
import { processBlock } from './consensus'
import launchApi from './api'

import meJSON from '../me.json'
import config from '../config.json'
import MysteryBox from './models/MysteryBox'

let me = meJSON

const argv = minimist(process.argv.slice(2))

if (argv.anonymous) {
  me = { address: '', privateKey: '' }
}

let synced = false

const booting = async () => {
  console.log(chalk.yellow('Loading...'))

  const chainId = await setup()

  console.log(chalk.yellow(`Connecting to network ${chainId}...`))

  const { net, services } = connect(chainId)

  console.log(chalk.green('Ready to go!'))

  net.onMessage(async (msg: Message<any>) => {
    // Receiving pending transactions
    if (msg.type == 'transactions' && config.services.blockchain) {
      const tx = Transaction.instantiate(msg.data)

      if (tx.status != 'pending') {
        return
      }

      BackendAdapter.instance.useWorldState().create(msg.type, tx.hash, tx)
    }

    // Receiving pending blocks
    if (msg.type == 'blocks' && config.services.blockchain) {
      const block: Block = Block.instantiate(msg.data)

      if (block.status != 'pending') {
        return
      }

      await processBlock(block, me, muffin)
    }

    // Responding to a sync request
    // by sending all missing blocks of source node
    if (msg.type == 'syncRequest' && config.services.blockchain) {
      if (msg.source.id == net.networkId) {
        return
      }

      const blockHeight = msg.data

      const blocks = await BackendAdapter.instance
        .useWorldState()
        .query('blocks', ['blockHeight', '>', blockHeight], 'asc')

      msg.source.send('syncResponse', blocks)
    }

    if (msg.type == 'syncResponse') {
      const blocks = msg.data

      for (let snapshot of blocks) {
        const block = Block.instantiate(snapshot)

        // console.log(currentBlockHash)

        if (block.parentHash != currentBlockHash) {
          continue
        }

        await processBlock(block, me, muffin, true)

        let updatedChain: Blockchain = await BackendAdapter.instance
          .useWorldState()
          .read('blockchain', 'blockchain')

        currentBlockHash = updatedChain.currentBlockHash
        meta = updatedChain.meta
      }

      console.log(
        chalk.green(`Blockchain synced to height ${meta.blocksCount - 1}`)
      )
    }

    // Mystery boxes
    if (msg.type == 'mysteryBoxResponse' && config.services.mysteryBoxes) {
      if (!Muffin.instance.awaitingMysteryBox) {
        return
      }

      const mysteryBox = MysteryBox.instantiate(msg.data)

      // Checking that the mystery box is the one we are waiting for
      const boxHash = hash(`${mysteryBox.createdAt}-${mysteryBox.publicKey}`)

      if (boxHash != Muffin.instance.awaitingMysteryBox) {
        return
      }

      delete Muffin.instance.awaitingMysteryBox

      BackendAdapter.instance
        .useMysteryBoxState()
        .create('mysteryBoxes', boxHash, mysteryBox)
    }
  })

  // Join the network
  await net.join()

  // Join the services on top of the network
  await services.join()

  // Syncing VM
  let { currentBlockHash, meta }: Blockchain = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  net.onNodeAvailable(async (node: Node) => {
    if (!synced) {
      console.log(chalk.yellow('Synchronizing blockchain...'))

      await net.broadcast('syncRequest', meta.blocksCount - 1)
      synced = true
    }
  })

  const muffin: Muffin = new Muffin({ net, services })

  // Launching APIs
  launchApi(argv.port)

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
      blockchain = await createBlockchain()

      console.log(chalk.green('Genesis block created.'))
    }

    return blockchain.meta.chainId
  } catch (e) {
    const blockchain = await createBlockchain()

    console.log(chalk.green('Genesis block created.'))

    return blockchain.meta.chainId
  }
}

const connect = (chainId: number) => {
  const net = new Network({
    name: `muffin${chainId}`,
  })

  const tcp = new TCPTransport({
    discovery: new TCPPeerMDNSDiscovery(),
    authentication: [new AnonymousAuth()],
    port: 8546,
  })

  // We need to manually add the first peer
  tcp.addManualPeer({
    host: config.network.firstPeer.host,
    port: config.network.firstPeer.port,
  })

  net.addTransport(tcp)

  // @ts-ignore
  const services = new Services(net)

  return { net, services }
}

booting()
