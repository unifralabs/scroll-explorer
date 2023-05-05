import { useState } from 'react'

import { Table, Tooltip } from 'antd'
import { useRouter } from 'next/router'
import { generate } from 'shortid'

import Link from '@/components/common/link'
import SkeletonTable from '@/components/common/skeleton-table'
import { TransArrowIcon } from '@/components/common/table-col-components'
import { PAGE_SIZE, TABLE_CONFIG } from '@/constants'
import { LinkTypeEnum } from '@/types'
import { convertNum, getTxsPaginationConfig, transDisplayNum, transDisplayTime, transDisplayTimeAgo } from '@/utils'
import { trpc } from '@/utils/trpc'

export const internalTxColumns = [
  { title: 'Block', dataIndex: 'blockNumber', render: (num: number | bigint) => <Link type={LinkTypeEnum.BLOCK} value={convertNum(num)} /> },
  { title: 'Age', dataIndex: 'blockTime', render: (time: number) => <Tooltip title={transDisplayTime(time)}>{transDisplayTimeAgo(time)}</Tooltip> },
  {
    title: 'Parent Txn Hash',
    dataIndex: 'parentTransactionHash',
    render: (parentTransactionHash: string) => <Link type={LinkTypeEnum.TX} value={parentTransactionHash} ellipsis />
  },
  { title: 'Type', dataIndex: 'op' },
  {
    title: 'From',
    dataIndex: 'from',
    render: (from: string) => <Link type={LinkTypeEnum.ADDRESS} value={from} width={TABLE_CONFIG.COL_WIDHT.ADDRESS} ellipsis />
  },
  { title: '', width: TABLE_CONFIG.COL_WIDHT.TRANS_ARROW_ICON, render: () => <TransArrowIcon /> },
  { title: 'To', dataIndex: 'to', render: (to: string) => <Link type={LinkTypeEnum.ADDRESS} value={to} width={TABLE_CONFIG.COL_WIDHT.ADDRESS} ellipsis /> },
  { title: 'Value', dataIndex: 'value', render: (num: string) => transDisplayNum({ num }) }
]

const InternalTxsTable: React.FC = () => {
  const router = useRouter()
  const search: any = router?.query

  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const { isLoading, data } = trpc.transaction.getInternalTransactionList.useQuery({
    offset: (current - 1) * pageSize,
    limit: pageSize,
    identity: search?.internalBlock
  })

  return (
    <SkeletonTable active loading={isLoading} columns={internalTxColumns}>
      <Table
        rowKey={generate}
        dataSource={data?.list as any[]}
        columns={internalTxColumns}
        pagination={getTxsPaginationConfig({ current, pageSize, total: Number(data?.count), totalLabel: 'internal transactions', setCurrent, setPageSize })}
      />
    </SkeletonTable>
  )
}

export default InternalTxsTable
