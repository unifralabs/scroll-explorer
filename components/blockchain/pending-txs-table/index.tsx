import { useState } from 'react'

import { Table } from 'antd'

import Link from '@/components/common/link'
import { MethodLabel, TransArrowIcon } from '@/components/common/table-col-components'
import { PAGE_SIZE, TABLE_CONFIG } from '@/constants'
import { LinkTypeEnum } from '@/types'
import { convertGwei, formatNum, getPaginationConfig, transDisplayNum, transDisplayTimeAgo } from '@/utils'
import { trpc } from '@/utils/trpc'

const columns = [
  { title: 'Txn Hash', dataIndex: 'hash', render: (num: number) => <Link type={LinkTypeEnum.TX} value={num} ellipsis /> },
  { title: 'Nonce', dataIndex: 'nonce' },
  { title: 'Method', dataIndex: 'methodName', render: (method: string) => <MethodLabel method={method} /> },
  { title: 'Last Seen', dataIndex: 'lastSeen', render: (time: number) => transDisplayTimeAgo(time) },
  { title: 'Gas Limit', dataIndex: 'gasLimit', render: (num: string) => formatNum(num) },
  { title: 'Gas Price', dataIndex: 'gasPrice', render: (num: string) => convertGwei(num) },
  {
    title: 'From',
    dataIndex: 'from',
    render: (from: string) => <Link type={LinkTypeEnum.ADDRESS} value={from} width={TABLE_CONFIG.COL_WIDHT.ADDRESS} ellipsis />
  },
  { title: '', width: TABLE_CONFIG.COL_WIDHT.TRANS_ARROW_ICON, render: () => <TransArrowIcon /> },
  { title: 'To', dataIndex: 'to', render: (to: string) => <Link type={LinkTypeEnum.ADDRESS} value={to} width={TABLE_CONFIG.COL_WIDHT.ADDRESS} ellipsis /> },
  { title: 'Value', dataIndex: 'value', render: (num: string) => transDisplayNum({ num }) }
]

const PendingTxsTable: React.FC = () => {
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const { data } = trpc.transaction.getPendingTransactionList.useQuery({ offset: (current - 1) * pageSize, limit: pageSize })

  return (
    <Table
      rowKey="hash"
      dataSource={data?.list}
      columns={columns}
      pagination={getPaginationConfig({ current, pageSize, total: Number(data?.count), setCurrent, setPageSize })}
    />
  )
}

export default PendingTxsTable
