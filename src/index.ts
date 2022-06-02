import BackendAdapter from './adapters/BackendAdapter'
import run from './console'
import getmac from 'getmac'
import hash from './common/hash'
import { Network, AnonymousAuth, Message } from 'ataraxia'
import { TCPTransport, TCPPeerMDNSDiscovery } from 'ataraxia-tcp'
import minimist from 'minimist'
import { Muffin } from './models/State'
import Transaction from './models/Transaction'
import { createBlockchain, signMessage, verifySignature } from './common'
import genesis from './genesis.json'
import { AddressReference } from './models/References'
import chalk from 'chalk'
import Blockchain from './models/Blockchain'
import Block from './models/Block'
import Account from './models/Account'
import me from './me.json'

const argv = minimist(process.argv.slice(2))

const booting = async () => {
  console.log(chalk.yellow('Loading...'))

  const chainId = await setup()

  console.log(chalk.yellow(`Connecting to network ${chainId}...`))

  const net = connect(chainId)

  console.log(chalk.green('Ready to go!'))

  net.onMessage(async (msg: Message<any>) => {
    // Receiving pending transactions
    if (msg.type == 'transactions') {
      const tx = Transaction.instantiate(msg.data)

      if (tx.status != 'pending') {
        return
      }

      BackendAdapter.instance.useWorldState().create(msg.type, tx.hash, tx)
    }

    // Receiving pending blocks
    if (msg.type == 'blocks') {
      const block: Block = Block.instantiate(msg.data)

      if (block.status != 'pending') {
        return
      }

      BackendAdapter.instance
        .useWorldState()
        .create('blocks', block.hash, block)

      const { contract }: Account = await BackendAdapter.instance
        .useWorldState()
        .read('accounts', '0x0')

      if (!contract) {
        return
      }

      const { stakes } = contract.storage

      // The expected validator is the one with the higher stake
      const expectedValidator = Object.keys(stakes).reduce((a, b) =>
        stakes[a] > stakes[b] ? a : b
      )

      if (block.validatedBy != expectedValidator) {
        return
      }

      const { currentBlockHash, meta } = await BackendAdapter.instance
        .useWorldState()
        .read('blockchain', 'blockchain')

      const isValid = block.confirm(currentBlockHash)

      // Punishing the validator if needed
      if (!isValid) {
        contract.storage.balances[block.validatedBy] -= 1
      }

      // Resetting validator blocks count
      contract.storage.blocks[block.validatedBy] = 0

      // Updating everyone's stake
      Object.keys(contract.storage.blocks).map((owner: any) => {
        if (owner == block.validatedBy) {
          return
        }

        const passedBlocks = contract.storage.blocks[owner] + 1
        contract.storage.blocks[owner] = passedBlocks

        contract.storage.stakes[owner] =
          passedBlocks * contract.storage.balances[owner]
      })

      // Updating contract storage
      await BackendAdapter.instance
        .useWorldState()
        .update('accounts', '0x0', { contract })

      // If the registered address is chosen, we submit a block
      const nextValidator = Object.keys(contract.storage.stakes).reduce(
        (a, b) =>
          contract.storage.stakes[a] > contract.storage.stakes[b] ? a : b
      )

      if (me.address == nextValidator) {
        const newBlock = await Block.generate(me.address as AddressReference)

        const { signature, recovery } = await signMessage(
          me.privateKey as AddressReference,
          newBlock.hash
        )

        newBlock.signature = signature
        newBlock.recovery = recovery

        // Broadcasting to the network
        muffin.net.broadcast('blocks', newBlock)

        // Storing in DB
        BackendAdapter.instance
          .useWorldState()
          .create('blocks', newBlock.hash, newBlock)
      }
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
