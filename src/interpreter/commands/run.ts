import inquirer from 'inquirer'
import { executeApp } from '../../common'

export default async function run() {
  const entries = await inquirer.prompt([
    {
      name: 'senderAddress',
      type: 'INPUT',
      message: 'Sender address:',
    },
    {
      name: 'receiverAddress',
      type: 'INPUT',
      message: 'Contract address:',
    },
    {
      name: 'amount',
      type: 'INPUT',
      message: 'Amount (FLT):',
    },
    {
      name: 'method',
      type: 'INPUT',
      message: 'Method name:',
    },
    {
      name: 'params',
      type: 'INPUT',
      message: 'Params:',
    },
  ])

  const { senderAddress, method, receiverAddress, params, amount } = entries

  const args = params.split(',')

  const { storage, res } = await executeApp(
    senderAddress,
    receiverAddress,
    amount,
    method,
    args
  )

  console.log('='.repeat(78))

  console.log(`Response: ${res}`)

  console.log(`Storage: ${JSON.stringify(storage)}`)

  return
}
