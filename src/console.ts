#!/usr/bin/env node

import inquirer from 'inquirer'
import chalk from 'chalk'
import figlet from 'figlet'
import interpreter from './interpreter'

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync('muffinVM', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      })
    )
  )

  console.log(chalk.yellow('v1'))

  console.log("Type 'help' to show commands")
}

const ask = () => {
  return inquirer.prompt([
    {
      name: 'COMMAND',
      type: 'INPUT',
      message: '>',
    },
  ])
}
const run = async () => {
  init()

  while (true) {
    const { COMMAND } = await ask()

    await interpreter(COMMAND)
  }
}

export default run
