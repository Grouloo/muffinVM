import accounts from './accounts'
import contracts from './contracts'
import estimations from './estimations'
import transactions from './transactions'

export default (app: any) => {
  app.use('/accounts', accounts)
  app.use('/contracts', contracts)
  app.use('/estimations', estimations)
  app.use('/transactions', transactions)
}
