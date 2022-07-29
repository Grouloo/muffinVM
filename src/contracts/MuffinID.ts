import { App, address, hex, hash, verifySignature } from 'muffin-utils'
import { AddressReference } from '../models/References'

type email = `${string}@${string}.${string}`
type url = `https://${string}.${string}`

type tokenField =
  | 'firstname'
  | 'middlename'
  | 'lastname'
  | 'username'
  | 'email'
  | 'picture'
  | 'birthdate'
  | 'createdAt'

type muffinIDContent = {
  firstname: string
  middlename: string
  lastname: string
  username: string
  email: string
  picture?: string
  birthdate: string
  city?: string
  country?: string
  createdAt: Date
}

type muffinAddress = `mx${string}`

class MuffinID extends App {
  tokenName: string = 'Muffin ID'
  tokenSymbol: string = 'MID'
  supply: number

  tokens: {
    [tokenId: muffinAddress]: muffinIDContent
  }

  owners: { [tokenId: muffinAddress]: address }
  balances: { [owner: address]: number }

  // Credentials = hash(`${publicKey}${muffinAddress}`)
  credentials: { [tokenId: muffinAddress]: hex }

  whitelist: { [address: AddressReference]: boolean }
  useWhitelist: boolean

  accessList: { [address: AddressReference]: boolean } = {
    '0xc82fc3693d8a0d4aec570181db36201696b79f3a': true,
    '0x9a9af2c45656d36116c51772daad9a4ce4af119d': true,
    '0x66dd45959911e855e6b0ef3c7c2cd17b389bd914': true,
  }

  constructor(data: any) {
    super(data)

    if (!this.supply) {
      this.supply = 0
    }

    if (!this.tokens) {
      this.tokens = {}
    }

    if (!this.owners) {
      this.owners = {}
    }

    if (!this.balances) {
      this.balances = {}
    }

    if (!this.credentials) {
      this.credentials = {}
    }

    if (!this.whitelist) {
      this.whitelist = {
        '0xc82fc3693d8a0d4aec570181db36201696b79f3a': true,
        '0x9a9af2c45656d36116c51772daad9a4ce4af119d': true,
        '0x66dd45959911e855e6b0ef3c7c2cd17b389bd914': true,
      }
    }

    if (this.useWhitelist != false) {
      this.useWhitelist = true
    }
  }

  #GenerateHash = (token: muffinIDContent): muffinAddress => {
    const hashed = hash(`${token.firstname}${token.lastname}${token.birthdate}`)

    const slicedHash = hashed.slice(2)

    const muffinAddress: muffinAddress = `mx${slicedHash}`

    return muffinAddress
  }

  #Authenticate = (
    muffinAddress: muffinAddress,
    signature: hex,
    recovery: 0 | 1
  ): boolean => {
    const hashedAddress = hash(muffinAddress)
    const { publicKey } = verifySignature(signature, hashedAddress, recovery)

    const credential = hash(`${publicKey}${muffinAddress}`)

    if (this.credentials[muffinAddress] != credential) {
      throw Error('Unauthorized.')
    }

    return true
  }

  #Authorized = (address: AddressReference): boolean => {
    if (!this.whitelist[address]) {
      throw Error('Transaction sender is not whitelisted.')
    }

    return true
  }

  whitelistAddress = (address: AddressReference) => {
    if (!this.accessList[this.msg.sender]) {
      throw Error('Sender is not authorized to do this action.')
    }

    this.whitelist[address] = true

    return
  }

  disableWhitelist = () => {
    if (!this.accessList[this.msg.sender]) {
      throw Error('Sender is not authorized to do this action.')
    }

    this.useWhitelist = false

    return
  }

  balanceOf = (owner: address): number => {
    return this.balances[owner] || 0
  }

  ownerOf = (tokenId: muffinAddress): address => {
    if (!this.owners[tokenId]) {
      throw "Specified Muffin ID doesn't exist."
    }

    return this.owners[tokenId]
  }

  name = (): string => {
    return this.tokenName
  }

  symbol = (): string => {
    return this.tokenSymbol
  }

  field = (tokenId: muffinAddress, field: tokenField): any => {
    if (!this.tokens[tokenId]) {
      throw Error("This Muffin ID doesn't exist.")
    }

    if (!(field in this.tokens[tokenId])) {
      throw Error("This field doesn't exist.")
    }

    return this.tokens[tokenId][field]
  }

  getMuffinID = (muffinAddress: muffinAddress) => {
    return this.tokens[muffinAddress]
  }

  // Minting
  mint = (data: any, signature: hex, recovery: 0 | 1) => {
    // Checking that the address is whitelisted
    this.#Authorized(this.msg.sender)

    // Checking that the price has been paid
    if (this.msg.amount != 60) {
      throw Error('The price for purchasing a Muffin ID is 60 FLT.')
    }

    const {
      firstname,
      middlename,
      lastname,
      username,
      email,
      picture,
      birthdate,
    } = JSON.parse(data)

    // Verifying data
    if (!firstname || typeof firstname != 'string') {
      throw Error('A Muffin ID must have a firstname.')
    }

    if (!middlename || typeof middlename != 'string') {
      throw Error('A Muffin ID must have a middlename.')
    }

    if (!lastname || typeof lastname != 'string') {
      throw Error('A Muffin ID must have a lastname.')
    }

    if (!username || typeof username != 'string') {
      throw Error('A Muffin ID must have a username.')
    }

    if (!email || typeof email != 'string') {
      throw Error('A Muffin ID must have an email.')
    }

    if (!birthdate) {
      throw Error('A Muffin ID must have a birth date.')
    }

    const createdAt = new Date()

    const token: muffinIDContent = {
      firstname,
      middlename,
      lastname,
      username,
      email,
      createdAt,
      picture,
      birthdate,
    }

    // Generating hash
    const tokenHash = this.#GenerateHash(token)

    // We have to check if the Muffin ID doesn't already exist
    if (this.tokens[tokenHash]) {
      throw Error('A similar Muffin ID already exists!')
    }

    // Registering the new Muffin ID
    this.tokens[tokenHash] = token

    // Generate credentials
    const { publicKey } = verifySignature(signature, hash(''), recovery)
    const credential = hash(`${publicKey}${tokenHash}`)

    // Registering credentials
    this.credentials[tokenHash] = credential

    // Bonding Muffin ID with account address
    this.owners[tokenHash] = this.msg.sender

    // Updating balane of owner
    this.balances[this.msg.sender] = 1
    this.supply++

    return
  }

  // Recovering a Muffin ID with a password
  recover = (muffinAddress: muffinAddress, signature: hex, recovery: 0 | 1) => {
    if (!muffinAddress) {
      throw Error('Must specify a Muffin ID address to recover.')
    }

    if (!signature) {
      throw Error(
        'To recover a Muffin ID, the address of the muffin ID must be signed with the private key.'
      )
    }

    if (this.balances[this.msg.sender] > 0) {
      throw Error('A Muffin ID is already linked to this account.')
    }

    this.#Authenticate(muffinAddress, signature, recovery)

    // Updating balances
    this.balances[this.owners[muffinAddress]] = 0
    this.balances[this.msg.sender] = 1

    // Associating the recovered Muffin ID with the new account
    this.owners[muffinAddress] = this.msg.sender
  }

  patch = (
    muffinAddress: muffinAddress,
    signature: hex,
    recovery: 0 | 1,
    data: any
  ) => {
    const { username, email, city, country, picture } = data

    const token = this.tokens[muffinAddress]

    if (!token) {
      throw Error("Specified Muffin ID doesn't exist.")
    }

    this.#Authenticate(muffinAddress, signature, recovery)

    if (username) {
      token.username = username
    }

    if (email) {
      token.email = email
    }

    if (city) {
      token.city = city
    }

    if (country) {
      token.country = country
    }

    if (picture) {
      token.picture = picture
    }

    // Saving token
    this.tokens[muffinAddress] = token
  }
}
