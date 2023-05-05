import { useState } from 'react'

import { Table } from 'antd'
import { generate } from 'shortid'

import { internalTxColumns } from '@/components/blockchain/internal-txs-table'
import SkeletonTable from '@/components/common/skeleton-table'
import { PAGE_SIZE } from '@/constants'
import { getPaginationConfig } from '@/utils'
import { trpc } from '@/utils/trpc'

const getColumns = () => {
  const columns = [...internalTxColumns]
  const parentTransactionHashCol = columns[2]

  columns.splice(2, 2)
  columns.unshift(parentTransactionHashCol)

  return columns
}

interface AddressInternalTxsTableProps {
  address: string
  isContract: boolean | undefined
}

const AddressInternalTxsTable: React.FC<AddressInternalTxsTableProps> = ({ address, isContract }) => {
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const { isLoading: addressLoading, data: addressInternalTxList } = trpc.address.getAddressInternalTxList.useQuery(
    { offset: (current - 1) * pageSize, limit: pageSize, address },
    { enabled: !!address && isContract !== undefined && !isContract }
  )

  const { isLoading: contractLoading, data: contractTxList } = trpc.contract.getContractTransactionList.useQuery(
    { offset: (current - 1) * pageSize, limit: pageSize, address },
    { enabled: !!address && isContract !== undefined && isContract }
  )

  return (
    <SkeletonTable active loading={addressLoading && contractLoading} columns={getColumns()}>
      <Table
        rowKey={generate}
        dataSource={(addressInternalTxList?.list || contractTxList?.list) as any[]}
        columns={getColumns()}
        pagination={getPaginationConfig({
          current,
          pageSize,
          totalLabel: 'internal transactions',
          total: Number(addressInternalTxList?.count || contractTxList?.count),
          setCurrent,
          setPageSize
        })}
      />
    </SkeletonTable>
  )
}

export { AddressInternalTxsTable }
