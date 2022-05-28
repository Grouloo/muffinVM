import { address } from '../types'

export interface ERC721 {
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

export interface ERC721Metadata extends ERC721 {
  name: () => string
  symbol: () => string
  tokenURI: (tokenId: number) => string
}
