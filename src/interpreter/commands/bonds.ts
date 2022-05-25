import chalk from 'chalk'
import BackendAdapter from '../../adapters/BackendAdapter'
import createBlockchain from '../../common/createBlockchain'
import Bond from '../../models/Bond'

async function generate() {
  const { meta } = await BackendAdapter.instance
    .useWorldState()
    .read('blockchain', 'blockchain')

  const bond = await Bond.generate(meta)

  return console.log(bond._toJSON())
}
export default { generate }
