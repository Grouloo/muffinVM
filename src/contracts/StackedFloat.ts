import { ERC20, App, address } from 'muffin-utils'

class StackedFloat extends App implements ERC20 {
  tokenName: string = 'Stacked Float'
  tokenSymbol: string = 'SFT'

  tokenTotalSupply: number
  distributedTokens: number
  balances: { [x: address]: number }
  allowed: { [x: address]: { [key: address]: number } }

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

    if (!this.distributedTokens) {
      this.distributedTokens = 0
    }
  }

  // Events
  protected Transfer = (from: address, to: address, value: number) => {
    if (value > this.balances[from]) {
      throw 'Not enough funds.'
    }

    this.balances[from] -= value
    this.balances[to] += value
  }

  protected Approval = (owner: address, spender: address, value: number) => {
    this.allowed[this.msg.sender][spender] = value
  }

  // Methods
  name = () => {
    return this.tokenName
  }

  symbol = () => {
    return this.tokenSymbol
  }

  totalSupply = () => {
    return this.tokenTotalSupply
  }

  balanceOf = (owner: address) => {
    if (!this.balances[owner]) {
      return 0
    }

    return this.balances[owner]
  }

  transfer = (to: address, value: number) => {
    this.Transfer(this.msg.sender, to, value)
  }

  transferFrom = (from: address, to: address, value: number) => {
    if (!this.allowed[from] || !this.allowed[from][this.msg.sender]) {
      throw 'Not allowed.'
    }

    if (value > this.allowed[from][this.msg.sender]) {
      throw 'Amount unallowed.'
    }

    this.allowed[from][this.msg.sender] -= value

    this.Transfer(from, to, value)
  }

  approve = (spender: address, value: number) => {
    if (
      !this.balances[this.msg.sender] ||
      value > this.balances[this.msg.sender]
    ) {
      throw 'Not enough funds.'
    }

    this.Approval(this.msg.sender, spender, value)
  }

  allowance = (owner: address, spender: address) => {
    if (!this.allowed[owner] || !this.allowed[owner][spender]) {
      return 0
    }

    return this.allowed[owner][spender]
  }
}
