import { App, ERC721Metadata, address } from '..'

export default class Certificate extends App implements ERC721Metadata {
  tokenName: string = 'MyCertificate'
  tokenSymbol: string = 'MCT'
  tokens: { [tokenId: number]: string }
  owners: { [tokenId: number]: address }
  approvals: { [tokenId: number]: address }
  balances: { [owner: address]: number }
  supply: number

  constructor(data: any) {
    super(data)

    if (!this.tokens) {
      this.tokens = {}
    }

    if (!this.owners) {
      this.owners = {}
    }

    if (!this.approvals) {
      this.approvals = {}
    }

    if (!this.balances) {
      this.balances = {}
    }

    if (!this.supply) {
      this.supply = 0
    }
  }

  #Transfer = (from: address, to: address, tokenId: number): void => {
    this.owners[tokenId] = to
    delete this.approvals[tokenId]

    this.balances[from] -= 1
    this.balances[to] += 1
  }

  #Approval = (owner: address, approved: address, tokenId: number): void => {
    this.approvals[tokenId] = approved
  }

  ApprovalForAll = (
    owner: address,
    operator: address,
    approved: boolean
  ): void => {}

  balanceOf = (owner: address): number => {
    return this.balances[owner] || 0
  }

  ownerOf = (tokenId: number): address => {
    if (tokenId > this.supply) {
      throw Error("Specified token doesn't exist.")
    }

    return this.owners[tokenId]
  }

  safeTransferFrom = (
    from: address,
    to: address,
    tokenId: number,
    data: { [x: string]: any }
  ): void => {
    if (tokenId > this.supply) {
      throw Error("Specified token doesn't exist.")
    }

    // In order to transfer a token, the sender have to own the token,
    // or have the approval of the owner to use it
    if (this.owners[tokenId] != from && this.approvals[tokenId] != from) {
      throw Error("Sender's account doesn't own specified token.")
    }

    this.#Transfer(from, to, tokenId)
  }

  transferFrom = (from: address, to: address, tokenId: number): void => {
    throw 'This is an unsafe method. Please use safeTransferFrom.'
  }

  approve = (approved: address, tokenId: number): void => {
    if (this.msg.sender != this.ownerOf(tokenId)) {
      throw "Sender doesn't own this token!"
    }

    this.#Approval(this.msg.sender, approved, tokenId)
  }

  setApprovalForAll = (operator: address, approved: address) => {
    throw Error('Method not supported')
  }

  getApproved = (tokenId: number): address => {
    if (tokenId > this.supply) {
      throw Error("Specified token doesn't exist.")
    }

    return this.approvals[tokenId]
  }

  isApprovedForAll = (owner: address, operator: address): boolean => {
    throw Error('Method not supported.')
  }

  name = (): string => {
    return this.tokenName
  }

  symbol = (): string => {
    return this.tokenSymbol
  }

  tokenURI = (tokenId: number): string => {
    if (tokenId > this.supply) {
      throw Error("Specified token doesn't exist.")
    }

    return this.tokens[tokenId]
  }
}
