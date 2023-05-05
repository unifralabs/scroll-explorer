import { useState } from 'react'

import { Card, Table, Tooltip } from 'antd'

import Link from '@/components/common/link'
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/common/skeleton-table'
import { L1StatusLabel } from '@/components/common/table-col-components'
import { PAGE_SIZE, TABLE_CONFIG } from '@/constants'
import { BlockType, LinkTypeEnum } from '@/types'
import { convertNum, formatNum, getPaginationConfig, transDisplayTime, transDisplayTimeAgo } from '@/utils'
import { trpc } from '@/utils/trpc'

const columns = [
  { title: 'L1 Status', width: TABLE_CONFIG.COL_WIDHT.L1_STATUS, render: ({ l1Status }: BlockType) => <L1StatusLabel l1Status={l1Status} /> },
  { title: 'Block', dataIndex: 'blockNumber', render: (num: number | bigint) => <Link type={LinkTypeEnum.BLOCK} value={convertNum(num)} /> },
  { title: 'Age', dataIndex: 'blockTime', render: (time: number) => <Tooltip title={transDisplayTime(time)}>{transDisplayTimeAgo(time)}</Tooltip> },
  {
    title: 'Txn',
    dataIndex: 'transactionCount',
    render: (num: number | bigint, { blockNumber }: BlockType) => (
      <Link type={LinkTypeEnum.BLOCKS} value={blockNumber}>
        {convertNum(num)}
      </Link>
    )
  },
  {
    title: 'Validator',
    dataIndex: 'validator',
    render: (validator: string) => <Link type={LinkTypeEnum.ADDRESS} value={validator} ellipsis />
  },
  { title: 'Gas Used', dataIndex: 'gasUsed', render: (num: string) => formatNum(num) },
  { title: 'Gas Limit', dataIndex: 'gasLimit', render: (num: string) => formatNum(num) }
]

const BlocksTableCard: React.FC<{ block_numbers?: number[] }> = props => {
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const { isLoading, data } = trpc.block.getBlockList.useQuery(
    { page: current, limit: pageSize, blockNumbers: props.block_numbers },
    { enabled: !props.block_numbers }
  )

  return (
    <Card>
      <SkeletonTable active loading={isLoading} columns={columns as SkeletonTableColumnsType[]}>
        <Table
          rowKey="blockHash"
          dataSource={data?.list as any}
          columns={columns}
          pagination={getPaginationConfig({ current, pageSize, total: Number(data?.count), totalLabel: 'blocks', setCurrent, setPageSize })}
          bordered={false}
        />
      </SkeletonTable>
    </Card>
  )
}

export default BlocksTableCard
