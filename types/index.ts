import { ContractCompilerTypeEnum } from '@/pages/verifyContract'

export type ApiResponse<T = any> = (T & Record<string, any>) | string

export type ApiPaginationResponse<T = any> = {
  count: number
  list: T[]
}

export type ApiPaginationParams<T = any> = {
  page: number
  limit: number
} & T

export enum LinkTypeEnum {
  BLOCK = 'block',
  BLOCKS = 'blocks',
  BATCH = 'batch',
  BATCHES = 'batches',
  CONTRACT_INTERNAL_TXS = 'txs',
  TX = 'transaction',
  CONTRACT = 'address-contract',
  ADDRESS = 'address-user',
  TOKEN = 'token',
  CROSS_BROWSER_TX = 'cross-browser-tx'
}

export enum L1StatusTypeEnum {
  UNCOMMITTED = 0,
  COMMITTED = 1,
  FINALIZED = 2,
  SKIPPED = 3
}

export const L1StatusType = ['Uncommitted', 'Committed', 'Finalized', 'Skipped']

export type BlockType = {
  Uncles: string
  blockHash: string
  blockNumber: number
  blockReward: string
  blockSize: number
  blockTime: number
  difficulty: number
  extraData: string
  gasLimit: number
  gasUsed: number
  transactionCount: number
  internalTransactionCount: number
  internalTransactionCountJoined: number
  status: L1StatusTypeEnum
  l1Status: L1StatusTypeEnum
  l1CommitTransactionHash: string | null
  l1FinalizeTransactionHash: string | null
  nonce: string
  parentHash: string
  sha3Uncle: string
  totalDifficult: number
  validator: string
}

export type BlockListType = ApiPaginationResponse<BlockType>

export enum TxStatusTypeEnum {
  FAILED = 0,
  SUCCEED = 1
}

export const TxStatusType = ['Failed', 'Success']

export enum TxCrossTransferTypeEnum {
  DEPOSIT = 0,
  WITHDRAW = 1
}

export const TxCrossTransferType = ['Deposit', 'Withdraw']

export type TokensTransferItemType = {
  contract: string
  decimals: number
  from: string
  name: string
  symbol: string
  to: string
  tokenId: string
  value: string
  logo_path: string
}

export type CrossTransferItemType = {
  type: TxCrossTransferTypeEnum
  l1TransactionHash: string
  l1Token: string
  l2Token: string
  from_: string
  to: string
  amount: string
  symbol: string
  decimals: number
}

export type InternalTxType = {
  blockHash: string
  blockNumber: number
  from: string
  from_tag: string | null
  gasLimit: number | null
  op: string
  parentTransactionHash: string
  to: string
  to_tag: string | null
  typeTraceAddress: string
  value: string
}

export type InternalTxListType = ApiPaginationResponse<InternalTxType>

export type TxType = {
  blockHash: string
  blockNumber: number | null
  blockTime: number
  firstSeen?: number
  lastSeen?: number
  errorInfo: string
  fee: string
  from: string
  functionName: string
  methodName: string
  gasLimit: number
  gasPrice: string
  gasUsed: number
  hash: string
  inputData: string
  l1Status: L1StatusTypeEnum
  l1CommitTransactionHash: string | null
  l1FinalizeTransactionHash: string | null
  maxFee: number
  maxPriority: number
  nonce: number
  status: TxStatusTypeEnum | undefined
  to: string
  internalTransfer?: InternalTxType[]
  tokenTransfer?: TokensTransferItemType[]
  crossTransfer?: CrossTransferItemType[]
  transactionIndex: number
  transactionType: 0 | 1 | 2
  value: string
}

export type TxListType = ApiPaginationResponse<TxType>

export type TxLogItemType = {
  address: string
  blockHash: string
  blockNumber: string
  data: string
  logIndex: number
  removed: boolean
  topics: string[]
  transactionHash: string
  transactionIndex: number
  eventAbi?: string
  eventFullName?: string
  eventName?: string
}

export type TxLogType = {
  list: TxLogItemType[]
}

export type BatchType = {
  idx: number
  batchHash: string
  commitHash: string
  commitTime: number
  proofHash: string | null
  proofTime: number | null
  blockNumbers: number[]
  blockCount: number
  transactionCount: number
  status: number
}

export type BatchListType = ApiPaginationResponse<BatchType>

// token list
export enum TokenTypeEnum {
  ERC20 = 1,
  ERC721 = 2,
  ERC1155 = 3
}

export type TokenType = {
  contractAddress: string
  createTxHash: string
  symbol: string
  contractType: TokenTypeEnum
  creator: string
  decimals: number
  logo_path: string
  totalSupply: string
  desc: string | null
  byteCode: string
  contractABI: string | null
  name: string
  standardJson: string | null
  compiler: string | null
  status: string | null
  description: string
}

export type TokenDetailType = TokenType & {
  holders: number
  contractAddress_tag: string | null
}

export type TokenListType = ApiPaginationResponse<TokenType>

// token tx list
export type TokenTxType = {
  Change: string
  OnChainMarketCap: string
  Price: string
  Volume: string
  desc: string
  description: string
  logo_path: string
  blockHash: string
  blockTime: number
  contract: string
  from: string
  logIndex: number
  functionName: string
  methodName: string
  methodId: string
  to: string
  tokenId: string
  tokenType: TokenTypeEnum
  transactionHash: string
  value: string
  trans_24h: string
  trans_3d: string
  name: string
  symbol: string
  decimals: number
}

export type TokenTxListType = ApiPaginationResponse<TokenTxType>

// token holders list
export type TokenHolderType = {
  address: string
  address_tag: string
  percentage: string
  value: string
  tokenId: string
}

export type TokenHoldersListType = ApiPaginationResponse<TokenHolderType>

export enum ContractVerifyStatusEnum {
  UNVERIFIED = 0,
  VERIFIED = 1
}

export enum ContractTypeEnum {
  ERC20 = 1,
  ERC721 = 2,
  ERC1155 = 3
}

export type ContractDetailType = {
  contractName: string
  contractAddress: string
  createTxHash: string
  contractType: number | ContractTypeEnum
  creator: string
  decimals: string
  totalSupply: string | null
  desc: string | null
  evmVersion: string
  license: string
  optimizationEnabled: string
  byteCode: string
  contractABI: string | null
  name: string
  symbol: string
  standardJson: string | null
  compiler: string | null
  status: ContractVerifyStatusEnum | null
  contractAddress_tag: string | null
  logo_path?: string
  sources?: { name: string; content: string }[]
}

export type ContractVerifyParamsType = {
  contractCompilerType: ContractCompilerTypeEnum
  upload_id: string
  contract_address: string
  compiler: string
  optimization?: boolean
  optimize_count?: number
  librarys?: {}
  evm?: string
  license?: string
}

export enum ContractVerifyStatus {
  FAILED = -1,
  UNPROCESSED = 0,
  SUCCESS = 1,
  VERIFIED = 2,
  PROCESSION = 3
}

export type Last14DaysTxCountStatisticsType = {
  last2weeks_count: number[][]
}

export type TxCountStatisticsType = {
  count: number[][]
}

export type StatisticsTimeQueryType = {
  timeStart: number
  timeEnd: number
}

export type CountStatisticsType = {
  date: string
  count: number
}[]

export type AddressTokenBalanceType = {
  name: string
  symbol: string
  contractAddress: string
  logo_path: string
  value: string
  tokenId: string
  decimals: number
}
