import { useEffect, useMemo, useState } from 'react'

import { Table } from 'antd'

import SkeletonTable, { SkeletonTableColumnsType } from '@/components/common/skeleton-table'
import { MethodLabel } from '@/components/common/table-col-components'
import { getTokenTxsColumns } from '@/components/tokens/token-txs-table'
import { PAGE_SIZE } from '@/constants'
import { TokenTypeEnum } from '@/types'
import { getPaginationConfig } from '@/utils'
import { trpc } from '@/utils/trpc'

const TokenDetailTxsTable: React.FC<{ tokenAddress: string; type: TokenTypeEnum; setCount?: any }> = ({ tokenAddress, type, setCount }) => {
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const { isLoading, data } = trpc.token.getTokenTransactionList.useQuery(
    {
      offset: (current - 1) * pageSize,
      limit: pageSize,
      address: tokenAddress,
      tokenType: type
    },
    { enabled: !!tokenAddress }
  )

  useEffect(() => {
    setCount && setCount(Number(data?.count))
  }, [data?.count, setCount])

  const columns = useMemo(() => {
    const cols = getTokenTxsColumns(Number(type))

    cols.splice(1, 0, {
      title: 'Method',
      dataIndex: 'methodId',
      render: (methodId: string) => <MethodLabel method={methodId.slice(0, 10)} />
    })
    cols.splice(TokenTypeEnum.ERC20 === Number(type) ? 7 : 8, 1)
    TokenTypeEnum.ERC20 !== Number(type) && cols.splice(-1, 1)

    return cols
  }, [type])

  return (
    <SkeletonTable active loading={isLoading} columns={columns as SkeletonTableColumnsType[]}>
      <Table
        rowKey={({ transactionHash, logIndex }) => `${transactionHash}${logIndex}`}
        dataSource={data?.list}
        columns={columns}
        pagination={getPaginationConfig({ current, pageSize, total: Number(data?.count), setCurrent, setPageSize })}
      />
    </SkeletonTable>
  )
}

export default TokenDetailTxsTable
