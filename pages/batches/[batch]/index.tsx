import { useCallback, useMemo } from 'react'

import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Space } from 'antd'
import classNames from 'classnames'
import { useRouter } from 'next/router'

import Link, { getLinkRoute } from '@/components/common/link'
import Loading from '@/components/common/loading'
import { OverviewCellContent } from '@/components/common/overview-content'
import PageTitle from '@/components/common/page-title'
import TabCard from '@/components/common/tab-card'
import { L1StatusLabel } from '@/components/common/table-col-components'
import Container from '@/layout/container'
import { LinkTypeEnum } from '@/types'
import { formatNum, transDisplayTime } from '@/utils'
import { trpc } from '@/utils/trpc'

import style from './index.module.scss'

const BlockchainBatchDetail: React.FC = () => {
  const router = useRouter()
  const search: any = router?.query
  const { batch } = search

  const { isLoading, data } = trpc.batch.getBatchDetail.useQuery(Number(batch), { enabled: !!batch })

  const leftArrowBtnDisabled = useMemo(() => [0, undefined].includes(data?.idx), [data?.idx])

  const rightArrowBtnDisabled = useMemo(() => undefined === data?.idx, [data?.idx])

  const goBatchDetail = useCallback(
    (disabled: boolean, num = 1) => {
      if (disabled) return

      router.push(getLinkRoute(LinkTypeEnum.BATCH, (data?.idx ?? 0) + num))
    },
    [data?.idx, router]
  )

  const cellContent = useMemo(
    () => [
      {
        label: 'Blocks',
        tooltip: 'Number of blocks in the batch',
        value: <a href={`/batches/${data?.idx}/blocks`}>{formatNum(data?.blockCount ?? 0)}</a>
      },
      {
        label: 'Transactions',
        tooltip: 'Number of transactions in the batch',
        value: formatNum(data?.transactionCount ?? 0)
      },
      {
        label: 'Commit Tx Hash',
        tooltip: "Hash of the transaction that commits the batch's data to L1",
        value: <Link type={LinkTypeEnum.CROSS_BROWSER_TX} value={data?.commitHash} target="_blank" />
      },
      {
        label: 'Commit Timestamp',
        tooltip: "Timestamp of the transaction that commits the batch's data to L1",
        value: transDisplayTime(data?.commitTime)
      },
      {
        label: 'Finalized Tx Hash',
        tooltip: "Hash of the transaction that finalizes the batch's data to L1",
        value: <Link type={LinkTypeEnum.CROSS_BROWSER_TX} value={data?.proofHash} target="_blank" />
      },
      {
        label: 'Finalized Timestamp',
        tooltip: "Timestamp of the transaction that finalizes the batch's data to L1",
        value: transDisplayTime(data?.proofTime)
      },
      {
        label: 'Status',
        tooltip:
          'Pre-committed: Block included in Scroll L2 blockchain Committed: Block transaction data submitted to Scroll L1 blockchain Finalized: Validity proof submitted and verified on Scroll L1 blockchain Skipped: Validity proof was skipped due to the lack of proving power',
        value: <L1StatusLabel l1Status={data?.status} />
      }
    ],
    [data?.idx, data?.transactionCount, data?.blockCount, data?.commitHash, data?.commitTime, data?.proofHash, data?.proofTime, data?.status]
  )

  if (isLoading) {
    return (
      <Container>
        <PageTitle title="Batch" />
        <Loading />
      </Container>
    )
  }

  return (
    <Container>
      <PageTitle
        title={
          <div className="flex items-center">
            <div>Batch</div>
            <div className="ml-20px mr-12">#{data?.idx}</div>
            <div className="flex items-center">
              <Space>
                <div className={classNames(style.arrowBtn, leftArrowBtnDisabled && style.disabled)} onClick={() => goBatchDetail(leftArrowBtnDisabled, -1)}>
                  <LeftOutlined />
                </div>
                <div className={classNames(style.arrowBtn, rightArrowBtnDisabled && style.disabled)} onClick={() => goBatchDetail(rightArrowBtnDisabled)}>
                  <RightOutlined />
                </div>
              </Space>
            </div>
          </div>
        }
      />
      <TabCard
        tabList={[
          {
            label: 'Overview',
            children: (
              <div>
                <div className="w-full border-1px border-solid border-border rounded-4">
                  <div className="p-24">
                    <OverviewCellContent data={cellContent} />
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />
    </Container>
  )
}

export default BlockchainBatchDetail
