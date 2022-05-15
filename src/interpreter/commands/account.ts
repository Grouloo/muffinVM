import chalk from 'chalk'
import hdkey from 'hdkey'
import inquirer from 'inquirer'
import createAccount from '../../common/createAccount'

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

export default { create, generatePrivateKey }
