import inquirer from 'inquirer'
import { verifySignature } from '../../common'
import signMessage from '../../common/signMessage'

async function message() {
  const entries = await inquirer.prompt([
    {
      name: 'PRIVATEKEY',
      type: 'INPUT',
      message: 'Private key:',
    },
    {
      name: 'MESSAGE',
      type: 'INPUT',
      message: 'Message:',
    },
  ])

  const privateKey = entries.PRIVATEKEY
  const message = entries.MESSAGE

  const { signature, recovery } = await signMessage(privateKey, message)

  console.log('='.repeat(78))

  console.log(`Signature: ${signature}`)

  console.log(`Recovery: ${recovery}`)

  return
}

async function verify() {
  const entries = await inquirer.prompt([
    {
      name: 'signature',
      type: 'INPUT',
      message: 'Signature:',
    },
    {
      name: 'MESSAGE',
      type: 'INPUT',
      message: 'Message:',
    },
    { name: 'recovery', type: 'INPUT', message: 'Recovery:' },
  ])

  const signature = entries.signature
  const message = entries.MESSAGE
  const recovery = parseInt(entries.recovery)

  const { address } = verifySignature(signature, message, recovery)

  console.log('='.repeat(78))

  console.log(`Address: ${address}`)

  return
}

export default { message, verify }
