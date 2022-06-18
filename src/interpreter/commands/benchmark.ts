import chalk from 'chalk'
import { hash } from '../../common'

export default async function benchmark() {
  console.log(chalk.yellow('Beginning benchmark.'))
  console.log(chalk.yellow('This might take a while, please wait...'))

  const startTime = new Date()

  const hashedRng = []

  for (let i = 0; i < 1000000; i++) {
    const rng = Math.random()

    hashedRng.push(hash(rng.toString()))
  }

  const endTime = new Date()

  const totalTime = new Date()
  totalTime.setSeconds(endTime.getSeconds() - startTime.getSeconds())

  const score = hashedRng.length / totalTime.getSeconds()

  console.log(chalk.blue('Done!'))

  console.log(chalk.green(`Benchmark results: ${score} hashes / seconds`))
}
