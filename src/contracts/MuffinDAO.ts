import { address, Token } from 'muffin-utils'

class MuffinDAO extends Token {
  tokenName: string = 'Muffin DAO'
  tokenSymbol: string = 'MFN'

  tokenTotalSupply: number
  balances: { [x: address]: number }
  allowed: { [x: address]: { [key: address]: number } }

  weekNotice: 2

  chairPersons: {}

  employees: {}

  constructor(data: any) {
    super(data)

    if (!this.tokenTotalSupply) {
      this.tokenTotalSupply = 0
    }

    if (!this.balances) {
      this.balances = {}
    }

    if (!this.allowed) {
      this.allowed = {}
    }
  }
}
