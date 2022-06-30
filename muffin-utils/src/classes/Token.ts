import { ERC20, address } from '..'
import App from './App'

export default class Token extends App implements ERC20 {
  tokenName: string = 'MyToken'
  tokenSymbol: string = 'MTN'
  tokenPrice: number = 100

  tokenTotalSupply: number
  tokenMaxSupply: number = 100

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
  }

  // Events
  #Transfer = (from: address, to: address, value: number) => {
    if (value > this.balances[from]) {
      throw Error('Not enough funds.')
    }

    this.balances[from] -= value

    if (!this.balances[to]) {
      this.balances[to] = 0
    }

    this.balances[to] += value
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
      throw Error('Not allowed.')
    }

    if (value > this.allowed[from][this.msg.sender]) {
      throw Error('Amount unallowed.')
    }

    this.allowed[from][this.msg.sender] -= value

    this.#Transfer(from, to, value)
  }

  approve = (spender: address, value: number) => {
    if (
      !this.balances[this.msg.sender] ||
      value > this.balances[this.msg.sender]
    ) {
      throw Error('Not enough funds.')
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
    // We can't mint new tokens if the max supply has been reached
    if (this.tokenMaxSupply <= this.tokenTotalSupply) {
      throw Error(`All ${this.tokenName} have already been minted.`)
    }

    if (this.msg.amount < amount * this.tokenPrice) {
      throw Error(
        `Not enough funds. A ${this.tokenName} costs ${this.tokenPrice} FLT.`
      )
    }

    if (this.msg.amount > amount * this.tokenPrice) {
      throw Error('Too much funds. Be careful when making transactions!')
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
      throw Error('Balance insufficient.')
    }

    this.tokenTotalSupply -= amount

    this.balances[account] -= amount
  }
}
