import inquirer from 'inquirer'
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

  const signature = signMessage(privateKey, message)

  console.log('='.repeat(78))

  console.log(`Signature: ${signature}`)

  return
}

async function verify() {
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

  const signature = signMessage(privateKey, message)

  console.log('='.repeat(78))

  console.log(`Signature: ${signature}`)

  return
}

export default { message, verify }
