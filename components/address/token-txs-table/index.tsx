import { useState } from 'react'

import { Table } from 'antd'

import SkeletonTable, { SkeletonTableColumnsType } from '@/components/common/skeleton-table'
import { getTokenTxsColumns } from '@/components/tokens/token-txs-table'
import { PAGE_SIZE } from '@/constants'
import { TokenTypeEnum } from '@/types'
import { getPaginationConfig } from '@/utils'
import { trpc } from '@/utils/trpc'

const AddressTokenTxsTable: React.FC<{ address: string | undefined; type: TokenTypeEnum }> = ({ address = '', type }) => {
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const { isLoading, data } = trpc.address.getAddressTokenTxList.useQuery(
    { offset: (current - 1) * pageSize, limit: pageSize, address, tokenType: type },
    { enabled: !!address }
  )

  return (
    <SkeletonTable active loading={isLoading} columns={getTokenTxsColumns(type) as SkeletonTableColumnsType[]}>
      <Table
        rowKey={({ transactionHash, logIndex }) => `${transactionHash}${logIndex}`}
        dataSource={data?.list}
        columns={getTokenTxsColumns(type)}
        pagination={getPaginationConfig({ current, pageSize, total: data?.count, setCurrent, setPageSize })}
      />
    </SkeletonTable>
  )
}

export default AddressTokenTxsTable
