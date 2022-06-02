import { ERC20, App, address } from 'muffin-utils'

class StackedFloat extends App implements ERC20 {
  tokenName: string = 'Stacked Float'
  tokenSymbol: string = 'SFT'

  tokenTotalSupply: number
  balances: { [x: address]: number }
  allowed: { [x: address]: { [key: address]: number } }
  blocks: { [x: address]: number }
  stakes: { [x: address]: number }

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

    if (!this.blocks) {
      this.blocks = {}
    }

    if (!this.stakes) {
      this.stakes = {}
    }
  }

  // Events
  #Transfer = (from: address, to: address, value: number) => {
    if (value > this.balances[from]) {
      throw 'Not enough funds.'
    }

    this.balances[from] -= value

    if (!this.balances[to]) {
      this.balances[to] = 0
    }

    this.balances[to] += value

    this.blocks[from] = 0
    this.stakes[from] = 0
  }

  #Approval = (owner: address, spender: address, value: number) => {
    if (!this.allowed[this.msg.sender]) {
      this.allowed[this.msg.sender] = {}
    }

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
    this.#Transfer(this.msg.sender, to, value)
  }

  transferFrom = (from: address, to: address, value: number) => {
    if (!this.allowed[from] || !this.allowed[from][this.msg.sender]) {
      throw 'Not allowed.'
    }

    if (value > this.allowed[from][this.msg.sender]) {
      throw 'Amount unallowed.'
    }

    this.allowed[from][this.msg.sender] -= value

    this.#Transfer(from, to, value)
  }

  approve = (spender: address, value: number) => {
    if (
      !this.balances[this.msg.sender] ||
      value > this.balances[this.msg.sender]
    ) {
      throw 'Not enough funds.'
    }

    this.#Approval(this.msg.sender, spender, value)
  }

  allowance = (owner: address, spender: address) => {
    if (!this.allowed[owner] || !this.allowed[owner][spender]) {
      return 0
    }

    return this.allowed[owner][spender]
  }

  // Minting
  mint = (account: address, amount: number) => {
    if (this.msg.amount < amount * 1000) {
      throw 'Not enough funds. A StackedFloat costs 1000 FLT.'
    }

    if (this.msg.amount > amount * 1000) {
      throw 'Too much funds. Be careful when making transactions!'
    }

    if (!this.balances[account]) {
      this.balances[account] = 0
    }

    this.tokenTotalSupply += amount

    this.balances[account] += amount
  }

  // Burning
  burn = (account: address, amount: number) => {
    if (this.balances[account] < amount) {
      throw 'Balance insufficient.'
    }

    this.tokenTotalSupply -= amount

    this.balances[account] -= amount

    this.msg.makeTransaction(account, amount * 1000)
  }
}
