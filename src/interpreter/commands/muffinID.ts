import chalk from 'chalk'
import inquirer from 'inquirer'
import BackendAdapter from '../../adapters/BackendAdapter'
import {
  calculateFees,
  composeMessage,
  createAccount,
  executeApp,
  hash,
  hextoString,
  signMessage,
  toHex,
} from '../../common'
import { generateEncryptionKey, decrypt } from 'symmetric-encrypt'
import Muffin from '../../models/Muffin'
import Transaction from '../../models/Transaction'

async function mint(muffin: Muffin) {
  const entries = await inquirer.prompt([
    {
      name: 'firstname',
      type: 'INPUT',
      message: 'Firstname:',
    },
    {
      name: 'middlename',
      type: 'INPUT',
      message: 'Middle name:',
    },
    {
      name: 'lastname',
      type: 'INPUT',
      message: 'Lastname:',
    },
    {
      name: 'birthdate',
      type: 'INPUT',
      message: 'Birthdate (yyyy-mm-dd):',
    },
    {
      name: 'username',
      type: 'INPUT',
      message: 'Username:',
    },
    {
      name: 'email',
      type: 'INPUT',
      message: 'Email:',
    },
    {
      name: 'muffinPassword',
      type: 'INPUT',
      message: chalk.blue('Muffin ID private password:'),
    },
    {
      name: 'privateKey',
      type: 'INPUT',
      message: chalk.yellow('private key:'),
    },
  ])

  const {
    firstname,
    middlename,
    lastname,
    birthdate: rawBirthdate,
    username,
    email,
    muffinPassword,
    privateKey,
  } = entries as { [x: string]: string }

  const birthdate = new Date(rawBirthdate)

  const muffinPrivatekey = hash(muffinPassword).slice(2)

  const snapshot: any = {
    firstname,
    middlename,
    lastname,
    username,
    email,
    birthdate,
  }

  const muffinID: any = {}

  // Encrypting fields
  await Promise.all(
    Object.keys(snapshot).map(async (field: string) => {
      console.log(chalk.yellow(`Encrypting ${field}...`))

      const encrypt = await generateEncryptionKey(
        hash(`${muffinPrivatekey}-${field}`)
      )
      const encryptedConfig = await encrypt(snapshot[field])

      const message = toHex(Buffer.from(JSON.stringify(encryptedConfig)))

      muffinID[field] = message
    })
  )

  // Getting address of sender
  const { address } = createAccount(privateKey)

  // Sign request
  const { signature: muffinSignature, recovery: muffinRecovery } =
    await signMessage(muffinPrivatekey, hash(''))

  const data = `mint('${JSON.stringify(
    muffinID
  )}','${muffinSignature}',${muffinRecovery})`

  // Sign tx
  const account = await BackendAdapter.instance
    .useWorldState()
    .read('accounts', address)
  const message = await composeMessage({
    nonce: account.nonce,
    fees: calculateFees(60, 0.01),
    to: '0x1',
    amount: 60,
    data,
  })
  const { signature, recovery } = await signMessage(privateKey, message)

  // Generate transaction
  const tx = await Transaction.generate(
    address,
    '0x1',
    60,
    data,
    signature,
    recovery,
    muffin
  )

  console.log(chalk.green('Transaction emitted!'))
  console.log(chalk.green(`Transaction hash: ${tx.hash}`))
  console.log(
    chalk.blue(
      `Muffin ID address if validated: mx${hash(
        `${muffinID.firstname}${muffinID.lastname}${muffinID.birthdate}`
      ).slice(2)}`
    )
  )

  return
}

// Get entire Muffin ID
async function read() {
  const entries = await inquirer.prompt([
    {
      name: 'muffinAddress',
      type: 'INPUT',
      message: 'Muffin ID address:',
    },
    {
      name: 'password',
      type: 'INPUT',
      message: 'Muffin ID password:',
    },
  ])

  const { muffinAddress, password } = entries

  // Fetching Muffin ID
  const { res: token } = await executeApp(
    `0x0`,
    `0x1`,
    0,
    'getMuffinID',
    `"${muffinAddress}"`
  )

  // Private key
  const muffinPrivatekey = hash(password).slice(2)

  const decryptedToken: any = {}

  // Decrypting fields
  for (let field of Object.keys(token)) {
    if (field == 'createdAt' || field == 'hash') {
      continue
    }

    const encryptionKey = hash(`${muffinPrivatekey}-${field}`)

    const encryptedMessage = hextoString(token[field])

    const message = await decrypt(encryptionKey, JSON.parse(encryptedMessage))

    decryptedToken[field] = message
  }

  console.log(`================`)
  console.log(decryptedToken)
}

async function generateKey() {
  const entries = await inquirer.prompt([
    {
      name: 'field',
      type: 'INPUT',
      message: 'Field name:',
    },
    {
      name: 'password',
      type: 'INPUT',
      message: 'Muffin ID password:',
    },
  ])

  console.log(chalk.yellow(`Please wait...`))

  const { field, password } = entries

  const privateKey = hash(password).slice(2)

  const key = hash(`${privateKey}-${field}`)

  console.log('================')
  console.log(chalk.green(`Generated key: ${key}`))
  console.log(chalk.green(`Use it to decrypt the ${field} of your MuffinID`))
}

async function decryptField() {
  const entries = await inquirer.prompt([
    {
      name: 'address',
      type: 'INPUT',
      message: 'Muffin ID address:',
    },
    {
      name: 'field',
      type: 'INPUT',
      message: 'Field name:',
    },
    {
      name: 'key',
      type: 'INPUT',
      message: 'Key:',
    },
  ])

  console.log(chalk.yellow(`Please wait...`))

  const { address, field, key } = entries

  // Fetching Muffin ID
  const { res } = await executeApp(
    `0x0`,
    `0x1`,
    0,
    'field',
    `"${address}","${field}"`
  )

  const parsedRes = JSON.parse(hextoString(res))

  const decryptedRes = await decrypt(key, parsedRes)

  console.log('================')
  console.log(chalk.green(`Decrypted field: ${decryptedRes}`))
}

export default { mint, read, generateKey, decryptField }
