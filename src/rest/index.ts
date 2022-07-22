import accounts from './accounts'
import blockchain from './blockchain'
import blocks from './blocks'
import contracts from './contracts'
import estimations from './estimations'
import transactions from './transactions'

export default (app: any) => {
  app.use('/accounts', accounts)
  app.use('/blockchain', blockchain)
  app.use('/blocks', blocks)
  app.use('/contracts', contracts)
  app.use('/estimations', estimations)
  app.use('/transactions', transactions)
}
