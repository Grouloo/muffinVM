type address = `0x${string}`

interface msg {
  sender: address
}

const msg: msg = {
  sender: '0x00',
}

interface ERC721 {
  ApprovalForAll: (owner: address, operator: address, approved: boolean) => void
  balanceOf: (owner: address) => number
  ownerOf: (tokenId: number) => address
  safeTransferFrom: (
    from: address,
    to: address,
    tokenId: number,
    data: { [x: string]: any }
  ) => void
  transferFrom: (from: address, to: address, tokenId: number) => void
  approve: (approved: address, tokenId: number) => void
  setApprovalForAll: (operator: address, approved: address) => void
  getApproved: (tokenId: number) => address
  isApprovedForAll: (owner: address, operator: address) => boolean
  // Minting & burning
  mint?: (to: address, tokenId: number) => void
  safeMint?: (to: address, tokenId: number, data?: { [x: string]: any }) => void
  burn?: (tokenId: address) => void
  // For enumerable collections
  totalSupply?: () => number
  tokenByIndex?: (index: number) => number
  tokenOfOwnerByIndex?: (owner: address, index: number) => number
}

interface ERC721Metadata extends ERC721 {
  name: () => string
  symbol: () => string
  tokenURI: (tokenId: number) => string
}

class MuffinID implements ERC721Metadata {
  tokenName: string = 'Muffin ID'
  tokenSymbol: string = 'MID'
  tokens: { [tokenId: number]: string } = {}
  owners: { [tokenId: number]: address } = {}
  approvals: { [tokenId: number]: address } = {}
  balances: { [owner: address]: number } = {}
  supply: number = 1

  constructor() {}

  protected Transfer = (from: address, to: address, tokenId: number): void => {
    this.owners[tokenId] = to
    delete this.approvals[tokenId]

    this.balances[from] -= 1
    this.balances[to] += 1
  }

  protected Approval = (
    owner: address,
    approved: address,
    tokenId: number
  ): void => {
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
      throw "Specified token doesn't exist."
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
      throw "Specified token doesn't exist."
    }

    // In order to transfer a token, the sender have to own the token,
    // or have the approval of the owner to use it
    if (this.owners[tokenId] != from && this.approvals[tokenId] != from) {
      throw "Sender's account doesn't own specified token."
    }

    this.Transfer(from, to, tokenId)
  }

  transferFrom = (from: address, to: address, tokenId: number): void => {
    throw 'This is an unsafe method. Please use safeTransferFrom.'
  }

  approve = (approved: address, tokenId: number): void => {
    if (msg.sender != this.ownerOf(tokenId)) {
      throw "Sender doesn't own this token!"
    }

    this.Approval(msg.sender, approved, tokenId)
  }

  setApprovalForAll = (operator: address, approved: address) => {
    throw 'Method not supported'
  }

  getApproved = (tokenId: number): address => {
    if (tokenId > this.supply) {
      throw "Specified token doesn't exist."
    }

    return this.approvals[tokenId]
  }

  isApprovedForAll = (owner: address, operator: address): boolean => {
    throw 'Method not supported.'
  }

  name = (): string => {
    return this.tokenName
  }

  symbol = (): string => {
    return this.tokenSymbol
  }

  tokenURI = (tokenId: number): string => {
    if (tokenId > this.supply) {
      throw "Specified token doesn't exist."
    }

    return this.tokens[tokenId]
  }
}
