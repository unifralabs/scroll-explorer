import { useState } from 'react'

import { Table } from 'antd'

import { txColumns } from '@/components/blockchain/txs-table'
import SkeletonTable from '@/components/common/skeleton-table'
import { PAGE_SIZE, TABLE_CONFIG } from '@/constants'
import { getPaginationConfig } from '@/utils'
import { trpc } from '@/utils/trpc'

interface AddressTxsTableProps {
  address: string
  isContract: boolean | undefined
}
const AddressTxsTable: React.FC<AddressTxsTableProps> = ({ address, isContract }) => {
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const { isLoading: addressLoading, data: addressTxs } = trpc.address.getAddressTxList.useQuery(
    {
      offset: (current - 1) * pageSize,
      limit: pageSize,
      address
    },
    { enabled: !!address && isContract !== undefined && !isContract }
  )

  const { isLoading: contractLoading, data: contractTxs } = trpc.contract.getContractTransactionList.useQuery(
    { offset: (current - 1) * pageSize, limit: pageSize, address },
    { enabled: !!address && isContract !== undefined && isContract }
  )

  return (
    <SkeletonTable active loading={addressLoading && contractLoading} columns={txColumns}>
      <Table
        scroll={TABLE_CONFIG.SCROLL_CONFIG}
        rowKey="hash"
        dataSource={addressTxs?.list || contractTxs?.list}
        columns={txColumns}
        pagination={getPaginationConfig({ current, pageSize, total: Number(addressTxs?.count || contractTxs?.count), setCurrent, setPageSize })}
      />
    </SkeletonTable>
  )
}

export { AddressTxsTable }
