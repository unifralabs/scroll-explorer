import { useState } from 'react'

import { Table, Tooltip } from 'antd'
import BigNumber from 'bignumber.js'

import Link, { TokenLink } from '@/components/common/link'
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/common/skeleton-table'
import { TransArrowIcon } from '@/components/common/table-col-components'
import { PAGE_SIZE, TABLE_CONFIG } from '@/constants'
import { LinkTypeEnum, TokenTxType, TokenTypeEnum } from '@/types'
import { getPaginationConfig, transDisplayNum, transDisplayTime, transDisplayTimeAgo } from '@/utils'
import { trpc } from '@/utils/trpc'

export const getTokenTxsColumns = (type: TokenTypeEnum) => {
  const cols = [
    {
      title: 'Txn Hash',
      dataIndex: 'transactionHash',
      render: (hash: string) => <Link type={LinkTypeEnum.TX} value={hash} ellipsis />
    },
    {
      title: 'Age',
      dataIndex: 'blockTime',
      render: (time: number | bigint) => <Tooltip title={transDisplayTime(Number(time))}>{transDisplayTimeAgo(Number(time))}</Tooltip>
    },
    {
      title: 'From',
      dataIndex: 'from',
      render: (from: string) => <Link type={LinkTypeEnum.ADDRESS} value={from} width={TABLE_CONFIG.COL_WIDHT.ADDRESS} ellipsis />
    },
    { title: '', width: TABLE_CONFIG.COL_WIDHT.TRANS_ARROW_ICON, render: () => <TransArrowIcon /> },
    { title: 'To', dataIndex: 'to', render: (to: string) => <Link type={LinkTypeEnum.ADDRESS} value={to} width={TABLE_CONFIG.COL_WIDHT.ADDRESS} ellipsis /> },
    { title: 'Value', dataIndex: 'value', render: (num: string, { decimals }: TokenTxType) => transDisplayNum({ num, decimals, suffix: '' }) },
    {
      title: 'Token',
      render: ({ name, symbol, contract, logo_path }: TokenTxType) => <TokenLink name={name} symbol={symbol} tokenAddress={contract} img={logo_path} ellipsis />
    }
  ]

  if (TokenTypeEnum.ERC20 !== type) {
    cols.splice(5, 0, {
      title: 'TokenID',
      dataIndex: 'tokenId',
      render: (tokenId: string) => (
        <Tooltip title={new BigNumber(tokenId, 16)?.toString(10)}>
          <div className="w-100px ellipsis">{new BigNumber(tokenId, 16)?.toString(10)}</div>
        </Tooltip>
      )
    })
  }

  TokenTypeEnum.ERC721 === type && cols.splice(6, 1)

  return cols
}

const TokenTxsTable: React.FC<{ type: TokenTypeEnum }> = ({ type }) => {
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const { isLoading, data } = trpc.token.getTokenTransactionList.useQuery(
    { offset: (current - 1) * pageSize, limit: pageSize, tokenType: type },
    { enabled: true }
  )

  return (
    <SkeletonTable active loading={isLoading} columns={getTokenTxsColumns(Number(type)) as SkeletonTableColumnsType[]}>
      <Table
        rowKey={({ transactionHash, logIndex }) => `${transactionHash}${logIndex}`}
        dataSource={data?.list}
        columns={getTokenTxsColumns(Number(type))}
        pagination={getPaginationConfig({ current, pageSize, total: Number(data?.count), setCurrent, setPageSize })}
      />
    </SkeletonTable>
  )
}

export default TokenTxsTable
