import chalk from 'chalk'
import hdkey from 'hdkey'
import inquirer from 'inquirer'
import createAccount from '../../common/createAccount'
import Account from '../../models/Account'

async function create() {
  const entries = await inquirer.prompt([
    {
      name: 'PRIVATEKEY',
      type: 'INPUT',
      message: 'Private key :',
    },
  ])

  const privateKey = entries.PRIVATEKEY

  const { address, publicKey } = createAccount(privateKey)

  console.log('='.repeat(78))

  console.log(`Address: ${address}`)
  console.log(`Public key: ${publicKey}`)

  return
}

async function generatePrivateKey() {
  const entries = await inquirer.prompt([
    {
      name: 'PASSPHRASE',
      type: 'INPUT',
      message: 'Passphrase :',
    },
    {
      name: 'REPEATPASSPHRASE',
      type: 'INPUT',
      message: 'Repeat passphrase :',
    },
  ])

  const passphrase = entries.PASSPHRASE
  const repeatPassphrase = entries.REPEATPASSPHRASE

  if (passphrase != repeatPassphrase) {
    throw 'Passphrases do not match!'
  }

  let { privateKey } = hdkey.fromMasterSeed(Buffer.from(passphrase, 'hex'))

  const { address, publicKey } = createAccount(privateKey.toString('hex'))

  console.log('='.repeat(78))

  console.log(`Address: ${address}`)
  console.log(`Public key: ${publicKey}`)
  console.log(`Private key: ${privateKey.toString('hex')}`)

  return
}

async function balance() {
  const entries = await inquirer.prompt([
    {
      name: 'address',
      type: 'INPUT',
      message: 'Address:',
    },
  ])

  const address = entries.address

  const balance = await Account.getBalance(address)

  console.log(chalk.green(`${balance} FLT`))

  return
}

export default { create, generatePrivateKey, balance }
