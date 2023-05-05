import { useState } from 'react'

import { Table, Tooltip } from 'antd'

import Link from '@/components/common/link'
import Pagination from '@/components/common/pagination'
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/common/skeleton-table'
import { L1StatusLabel, MethodLabel, TransArrowIcon } from '@/components/common/table-col-components'
import { TABLE_CONFIG } from '@/constants'
import { LinkTypeEnum, TxType } from '@/types'
import { convertGwei, transDisplayNum, transDisplayTime, transDisplayTimeAgo } from '@/utils'
import message from '@/utils/message'
import { trpc } from '@/utils/trpc'

export const txColumns = [
  { title: 'L1 Status', fixed: true, width: TABLE_CONFIG.COL_WIDHT.L1_STATUS, render: ({ l1Status }: TxType) => <L1StatusLabel l1Status={l1Status} /> },
  {
    title: 'Txn Hash',
    dataIndex: 'hash',
    render: (hash: string) => <Link type={LinkTypeEnum.TX} value={hash} width={TABLE_CONFIG.COL_WIDHT.ADDRESS} ellipsis />
  },
  { title: 'Method', dataIndex: 'inputData', render: (inputData: string) => <MethodLabel method={inputData.slice(0, 10)} /> },
  { title: 'Block', dataIndex: 'blockNumber', render: (num: number) => <Link type={LinkTypeEnum.BLOCK} value={num} /> },
  {
    title: 'Age',
    dataIndex: 'blockTime',
    width: TABLE_CONFIG.COL_WIDHT.AGE,
    render: (time: number) => <Tooltip title={transDisplayTime(time)}>{transDisplayTimeAgo(time)}</Tooltip>
  },
  {
    title: 'From',
    dataIndex: 'from',
    render: (from: string) => <Link type={LinkTypeEnum.ADDRESS} value={from} width={TABLE_CONFIG.COL_WIDHT.ADDRESS} ellipsis />
  },
  { title: '', width: TABLE_CONFIG.COL_WIDHT.TRANS_ARROW_ICON, render: () => <TransArrowIcon /> },
  { title: 'To', dataIndex: 'to', render: (to: string) => <Link type={LinkTypeEnum.ADDRESS} value={to} width={TABLE_CONFIG.COL_WIDHT.ADDRESS} ellipsis /> },
  { title: 'Value', dataIndex: 'value', render: (num: string) => transDisplayNum({ num }) },
  { title: 'Txn Fee', dataIndex: 'fee', width: TABLE_CONFIG.COL_WIDHT.TXFEE, render: (num: string) => transDisplayNum({ num: num, fixedNum: 9 }) },
  { title: 'Gas Price', dataIndex: 'gasPrice', render: (num: string) => convertGwei(num) }
]

const TxsTable: React.FC = () => {
  const [current, setCurrent] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)
  const [input, setInput] = useState<{ limit: number; cursor?: number }>({ limit: pageSize })
  const { isFetching, data, error } = trpc.transaction.getTransactionList.useQuery(input)
  console.log('current', current)
  const onCursorChange = (value: string) => {
    let cursor
    switch (value) {
      case 'next':
        cursor = data?.cursor
        setCurrent(current + 1)
        break
      case 'prev':
        cursor = data?.cursor ? data?.cursor + pageSize * 2 : undefined
        setCurrent(current - 1)
        break
      case 'first':
        cursor = undefined
        setCurrent(1)
        break
      case 'last':
        cursor = 0
        setCurrent(-1)
        break
      default:
        cursor = undefined
        break
    }
    setInput({ ...input, cursor })
  }
  if (error) {
    console.log(error)
    message.error('Internal Server Error')
  }
  return (
    <SkeletonTable active loading={isFetching} columns={txColumns as SkeletonTableColumnsType[]}>
      <Pagination
        currentPage={current}
        totalResults={data?.count || 0}
        pageSize={pageSize}
        onPageSizeChange={(value: number) => {
          setPageSize(value)
          setInput({ ...input, limit: value })
        }}
        onCursorChange={onCursorChange}
      />
      <Table scroll={TABLE_CONFIG.SCROLL_CONFIG} rowKey="hash" dataSource={data?.list as any} columns={txColumns} pagination={false} />
      <Pagination
        currentPage={current}
        totalResults={data?.count || 0}
        pageSize={pageSize}
        onPageSizeChange={(value: number) => {
          setPageSize(value)
          setInput({ ...input, limit: value })
        }}
        onCursorChange={onCursorChange}
      />
    </SkeletonTable>
  )
}

export default TxsTable
