import { Network } from 'ataraxia'
import chalk from 'chalk'
import hdkey from 'hdkey'
import inquirer from 'inquirer'
import { Muffin } from '../../models/State'

async function nodes(muffin: Muffin) {
  console.log(muffin.net.nodes)

  return
}

export default { nodes }
