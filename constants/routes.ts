const ROUTES = {
  HOME: '/',
  BLOCK_CHAIN: {
    TXNS: '/txs',
    PENDING_TXNS: '/txsPending',
    CONTRACT_TXNS: '/txsInternal',
    BLOCKS: '/blocks',
    BATCHES: '/batches',
    DETAIL: {
      TX: '/tx/:tx',
      BLOCK: '/blocks/:block',
      BATCH: '/batches/:batch',
      ADDRESS: '/address/:address',
      TOKEN: '/token/:token'
    }
  },
  CONTRACT: {
    VERIFY: '/verifyContract',
    PUBLISH: '/publishContract/:contractAddress'
  },
  TOKENS: {
    ERC20: '/tokens',
    ERC20_TRANS: '/tokentxns',
    ERC721: '/tokens-nft',
    ERC721_TRANS: '/tokentxns-nft',
    ERC1155: '/tokens-nft1155',
    ERC1155_TRANS: '/tokentxns-nft1155'
  },
  CHARTS: {
    INDEX: '/charts',
    DETAIL: '/charts/:chart'
  }
}

export default ROUTES
