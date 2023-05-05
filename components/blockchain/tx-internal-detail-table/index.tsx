import { DatabaseFilled } from '@ant-design/icons'
import { Table } from 'antd'
import { generate } from 'shortid'

import Link from '@/components/common/link'
import Loading from '@/components/common/loading'
import { TransArrowIcon } from '@/components/common/table-col-components'
import { TABLE_CONFIG } from '@/constants'
import { LinkTypeEnum } from '@/types'
import { transDisplayNum } from '@/utils'
import { trpc } from '@/utils/trpc'

const internalTransferColumns = [
  { title: 'Type Trace Address', dataIndex: 'typeTraceAddress' },
  { title: 'From', dataIndex: 'from', render: (from: string) => <Link type={LinkTypeEnum.ADDRESS} value={from} ellipsis /> },
  { title: '', width: TABLE_CONFIG.COL_WIDHT.TRANS_ARROW_ICON, render: () => <TransArrowIcon /> },
  { title: 'To', dataIndex: 'to', render: (to: string) => <Link type={LinkTypeEnum.ADDRESS} value={to} ellipsis /> },
  { title: 'Value', dataIndex: 'value', render: (num: string) => transDisplayNum({ num }) }
]

const TxInternalDetailTable: React.FC<{ from: string; to: string; tx: string }> = ({ from, to, tx }) => {
  const { isLoading, data: txDetail } = trpc.transaction.getInternalTransactionDetail.useQuery(tx, { enabled: !!tx })

  if (isLoading) return <Loading />

  return (
    <div>
      <div className="flex items-center mb-12">
        <DatabaseFilled className="text-12 mr-6px text-secondText" />
        <span>The contract call</span>
        <b className="mx-4px">From</b>
        <Link type={LinkTypeEnum.ADDRESS} value={from} ellipsis />
        <b className="mx-4px">To</b>
        <Link type={LinkTypeEnum.ADDRESS} value={to} ellipsis />
        <span className="ml-4px">
          produced {txDetail?.length} Internal Transaction{(txDetail?.length ?? 0) > 1 ? 's' : ''}
        </span>
      </div>
      <Table rowKey={generate} dataSource={txDetail as any} columns={internalTransferColumns} pagination={false} />
    </div>
  )
}

export default TxInternalDetailTable
