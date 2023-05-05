import { useState } from 'react'

import { Card, Table, Tooltip } from 'antd'

import Link from '@/components/common/link'
import SkeletonTable from '@/components/common/skeleton-table'
import { L1StatusLabel } from '@/components/common/table-col-components'
import { PAGE_SIZE, TABLE_CONFIG } from '@/constants'
import { BatchType, BlockType, LinkTypeEnum } from '@/types'
import { formatNum, getPaginationConfig, transDisplayTime, transDisplayTimeAgo } from '@/utils'
import { trpc } from '@/utils/trpc'

const columns = [
  { title: 'L1 Status', width: TABLE_CONFIG.COL_WIDHT.L1_STATUS, render: ({ status }: BlockType) => <L1StatusLabel l1Status={status} /> },
  { title: 'Batch Index', dataIndex: 'idx', render: (idx: number) => <Link type={LinkTypeEnum.BATCH} value={idx} /> },
  {
    title: 'Age',
    dataIndex: 'commitTime',
    render: (commitTime: number) => <Tooltip title={transDisplayTime(commitTime)}>{transDisplayTimeAgo(commitTime)}</Tooltip>
  },
  {
    title: 'Txn',
    dataIndex: 'transactionCount',
    render: (num: string) => formatNum(num)
  },
  {
    title: 'Commit Tx Hash',
    dataIndex: 'commitHash',
    render: (commitHash: string) => (
      <Link type={LinkTypeEnum.CROSS_BROWSER_TX} value={commitHash} width={TABLE_CONFIG.COL_WIDHT.TXHASH} ellipsis target="_blank" />
    )
  },
  {
    title: 'Finalized Tx Hash',
    dataIndex: 'proofHash',
    render: (proofHash: string) => (
      <Link type={LinkTypeEnum.CROSS_BROWSER_TX} value={proofHash} width={TABLE_CONFIG.COL_WIDHT.TXHASH} ellipsis target="_blank" />
    )
  }
]

const BatchesTableCard: React.FC = () => {
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const { isLoading, data } = trpc.batch.getBatchList.useQuery({ offset: (current - 1) * pageSize, limit: pageSize })

  return (
    <Card>
      <SkeletonTable active loading={isLoading} columns={columns}>
        <Table
          rowKey="idx"
          dataSource={data?.list as BatchType[]}
          columns={columns}
          pagination={getPaginationConfig({ current, pageSize, total: Number(data?.count), totalLabel: 'batches', setCurrent, setPageSize })}
          bordered={false}
        />
      </SkeletonTable>
    </Card>
  )
}

export default BatchesTableCard
