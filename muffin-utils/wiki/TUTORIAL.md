# How to write a contract

## Introduction

Contracts are scripts that are stored and executed on Muffin Network.

Contracts primary function is to manage tokens, certificates and DAOs, but anything can be done with them and are a great way to handle payments in an application.

On the technical aspect, contracts are Javascript classes for which the instance is stored on the network.

Contracts can also be written in Typescript, but Muffin Network will only store the Javascript es2015 compiled code.

## Structure of a contract

Here’s an example of what a contract looks like:

```tsx
import { App, ERC20, address } from 'muffin-utils'

class MyToken extends App implements ERC20 {
  tokenName: string = 'MyToken'
  tokenSymbol: string = 'MTN'

  tokenTotalSupply: number
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
    if (this.msg.amount < amount * 1000) {
      throw Error('Not enough funds. MyToken costs 1000 FLT.')
    }

    if (this.msg.amount > amount * 1000) {
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

    this.msg.makeTransaction(account, amount * 1000)
  }
}
```

So, let’s see how it works.

### Importing dependancies

```jsx
import { App, ERC20, address } from 'muffin-utils'
```

The NPM module _muffin-utils_ is the only one that you can import in a contract.

It provides useful tools that will help you to build your contract.

As you can see, we imported 3 things from _muffin-utils_ for this contract, let’s dive in:

- **App** - This one is actually required to make a contract. It is a parent class that will help the system to restore the contract’s state, and that will inject the _msg_ attribute that we will see later
- **ERC20** - This interface will help us to implement the [ERC20 norm](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/) into our contract correctly.
- **address** - A type that will check that a string is an address.

### Contract declaration

```tsx
class MyToken extends App implements ERC20 {
```

On Muffin, a contract is declare like any other Javascript class.

Here, we can notice that we extend our contract with the parent class _App_, and that wz implement the _ERC20_ interface.

Unless you know what you are doing, don’t forget to extends the class with _App_, or your contract won’t be able to recover its previous state.

### Constants and types declaration

```tsx
tokenName: string = 'MyToken'
tokenSymbol: string = 'MTN'

tokenTotalSupply: number
balances: { [x: address]: number }
allowed: { [x: address]: { [key: address]: number } }
```

If you are writing your contract in Typescript, you’ll have to delare the types of your attributes at the top of the class.

Even if you’re using Javascript, you should declare your class constants outside the constructor for a better readability.

We will see how to declare variable attributes during next step.

### Constructor

```tsx
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
```

Your contract **will always need** a constructor that takes an object _data_ as only argument.

You’ll then have to pass _data_ to _super()_

In case you’re not familliar with Object-Oriented Programming, the _super()_ function will call the constructor of the parent class, in this case _App_

If you have attributes that may change during execution, you can initialize them here.

### Private methods

```tsx
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
```

If you don’t want users messing with some of your methods, you can make them private by adding a ‘_#’_ before their name.

The example above is the method that will allow us to transfer our tokens from an account to another. We will use it in our code, but we definitively don’t want our users to be able to call this.

### The msg attribute

```tsx
// Minting
mint = (account: address, amount: number) => {
  if (this.msg.amount < amount * 1000) {
    throw Error('Not enough funds. MyToken costs 1000 FLT.')
  }

  if (this.msg.amount > amount * 1000) {
    throw Error('Too much funds. Be careful when making transactions!')
  }

  if (!this.balances[account]) {
    this.balances[account] = 0
  }

  this.tokenTotalSupply += amount

  this.balances[account] += amount
}
```

If you have extended your contract with _App_, you will be able to access an attribute named _msg_.

_msg_ is an object containing the following properties:

- **sender** - The address of the account calling the contract
- **amount** - The amount sent to the contract during the transaction
- **makeTransaction(to, total, data)** - This function will allow your contract to send new transactions

```tsx
this.msg.makeTransaction(account, amount * 1000)
```

### Deploy to testnet

First, you’ll have to download [muffinVM](https://github.com/Grouloo/muffinVM).

In ‘./muffinVM’, edit the ‘deployment.json’ file as follows:

```tsx
{
  "language": "javascript",
  "className": [THE NAME OF THE CLASS TO INSTANTIATE IN YOUR CONTRACT],
  "script": [STRINGIFIED COMPILED CODE OF YOUR CONTRACT]
}
```

To stringify the code, you can use [this tool](https://onlinetexttools.com/json-stringify-text).

Then, launch muffinVM console and use the command

```tsx
contracts deploy
```
