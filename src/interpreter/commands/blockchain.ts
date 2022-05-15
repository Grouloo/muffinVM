import chalk from 'chalk'
import createBlockchain from '../../common/createBlockchain'

async function init(path: string) {
  const blockchain = await createBlockchain(path)

  console.log(blockchain)

  console.log(chalk.green('Blockchain initialized.'))

  return
}

export default { init }
