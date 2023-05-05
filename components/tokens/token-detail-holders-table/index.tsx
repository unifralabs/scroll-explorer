import { useEffect, useMemo, useState } from 'react'

import { Progress, Table, Tooltip } from 'antd'
import BigNumber from 'bignumber.js'
import { generate } from 'shortid'

import Link from '@/components/common/link'
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/common/skeleton-table'
import { PAGE_SIZE } from '@/constants'
import { LinkTypeEnum, TokenHolderType, TokenTypeEnum } from '@/types'
import { getPaginationConfig, transDisplayNum } from '@/utils'
import { trpc } from '@/utils/trpc'

const TokenDetailHoldersTable: React.FC<{ tokenAddress: string; type: TokenTypeEnum }> = ({ tokenAddress, type }) => {
  const [firstDataPercent, setFirstDataPercent] = useState<number>(1)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const { isLoading, data } = trpc.token.getTokenHolders.useQuery(
    { offset: (current - 1) * pageSize, limit: pageSize, address: tokenAddress },
    { enabled: !!tokenAddress }
  )

  useEffect(() => {
    setFirstDataPercent(Number(data?.list?.[0]?.percentage) ?? 1)
  }, [data?.list])

  const columns = useMemo(
    () => [
      { title: 'Rank', width: 60, render: (_data: unknown, _: TokenHolderType, index: number) => index + (current - 1) * pageSize + 1 },
      { title: 'Address', dataIndex: 'address', render: (address: string) => <Link type={LinkTypeEnum.ADDRESS} value={address} /> },
      ...(type === TokenTypeEnum.ERC1155
        ? [
            {
              title: 'TokenID',
              dataIndex: 'tokenId',
              render: (tokenId = 0) => (
                <Tooltip title={new BigNumber(tokenId, 16)?.toString(10)}>
                  <div className="w-100px ellipsis">{new BigNumber(tokenId, 16)?.toString(10)}</div>
                </Tooltip>
              )
            }
          ]
        : []),
      {
        title: 'Quantity',
        render: ({ value }: TokenHolderType) => transDisplayNum({ num: value, fixedNum: 6, suffix: '', decimals: 0 })
      },
      {
        title: 'Percentage',
        render: ({ percentage }: TokenHolderType) => (
          <div>
            <div className="mb-[-8px]">{transDisplayNum({ num: Number(percentage), fixedNum: 4, suffix: '%', decimals: 0 })}</div>
            <Progress
              percent={(Number(percentage ?? 1) / firstDataPercent) * 100}
              showInfo={false}
              strokeWidth={2}
              strokeColor={{ from: '#f3ccb6', to: '#cb8158', direction: 'to right' }}
            />
          </div>
        )
      }
    ],
    [current, firstDataPercent, pageSize, type]
  )

  return (
    <SkeletonTable active loading={isLoading} columns={columns as SkeletonTableColumnsType[]}>
      <Table
        rowKey={generate}
        dataSource={data?.list as any[]}
        columns={columns}
        pagination={getPaginationConfig({ totalLabel: 'holders', current, pageSize, total: Number(data?.count), setCurrent, setPageSize })}
      />
    </SkeletonTable>
  )
}

export default TokenDetailHoldersTable
