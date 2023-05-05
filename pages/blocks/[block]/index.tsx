import { useCallback, useMemo } from 'react'

import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Space } from 'antd'
import classNames from 'classnames'
import { useRouter } from 'next/router'

import Link, { getLinkRoute } from '@/components/common/link'
import Loading from '@/components/common/loading'
import { OverviewCards, OverviewCellContent } from '@/components/common/overview-content'
import PageTitle from '@/components/common/page-title'
import TabCard from '@/components/common/tab-card'
import { L1StatusLine } from '@/components/common/table-col-components'
import { BLOCK_INTERVAL } from '@/constants'
import Container from '@/layout/container'
import { LinkTypeEnum } from '@/types'
import { convertNum, formatNum, transDisplayNum, transDisplayTime, transDisplayTimeAgo } from '@/utils'
import { trpc } from '@/utils/trpc'

import style from './index.module.scss'

const BlockchainBlockDetail: React.FC = () => {
  const router = useRouter()
  const search: any = router?.query
  const { block } = search

  const blockHeight = trpc.block.getBlockHeight.useQuery()
  const { isLoading, data } = trpc.block.getBlockDetail.useQuery({ identity: block }, { enabled: !!block })

  const leftArrowBtnDisabled = useMemo(() => [0, undefined].includes(data?.blockNumber), [data?.blockNumber])

  const rightArrowBtnDisabled = useMemo(
    () => undefined === data?.blockNumber || undefined === blockHeight || blockHeight === data?.blockNumber,
    [blockHeight, data?.blockNumber]
  )

  const goBlockDetail = useCallback(
    (disabled: boolean, num = 1) => {
      if (disabled) return

      router.push(getLinkRoute(LinkTypeEnum.BLOCK, (Number(data?.blockNumber) ?? 0) + num))
    },
    [data?.blockNumber, router]
  )

  const overviewContent = useMemo(
    () => [
      {
        colSpan: 7,
        img: 'fee',
        content: [
          {
            label: 'Transactions',
            value:
              (data?.transactionCount ?? 0) > 0 ? (
                <Link type={LinkTypeEnum.BLOCKS} value={convertNum(data?.blockNumber)}>
                  {convertNum(data?.transactionCount)}
                </Link>
              ) : (
                0
              )
          },
          {
            tooltip:
              'The number of transactions in the block. Internal transaction is transactions as a result of contract execution that involves Ether value.',
            label: 'Contract Internal',
            value:
              (data?.internalTransactionCountJoined ?? 0) > 0 ? (
                <Link type={LinkTypeEnum.CONTRACT_INTERNAL_TXS} value={convertNum(data?.blockNumber)}>
                  {convertNum(data?.internalTransactionCountJoined)}
                </Link>
              ) : (
                0
              )
          }
        ]
      },
      {
        img: 'value',
        content: [
          {
            tooltip: 'User-defined tips sent to validator for transation priority/inclusion.',
            label: 'Block Reward',
            value: transDisplayNum({ num: data?.blockReward, fixedNum: 6 })
          }
        ]
      },
      {
        colSpan: 5,
        img: 'size',
        content: [
          {
            tooltip: `The block size is actually determined by the block's gas limit.`,
            label: 'Size（bytes）',
            value: formatNum(data?.blockSize ?? 0)
          }
        ]
      },
      {
        img: 'gas_used',
        content: [
          {
            tooltip: 'The total gas used in the block and its percentage of gas filled in the block.',
            label: 'Gas Used',
            value: formatNum(data?.gasUsed ?? 0)
          }
        ]
      }
    ],
    [data?.blockNumber, data?.blockReward, data?.blockSize, data?.gasUsed, data?.internalTransactionCountJoined, data?.transactionCount]
  )

  const cellContent = useMemo(
    () => [
      {
        label: 'Total Difficulty',
        tooltip: 'Total difficulty of the chain until this block.',
        value: formatNum(data?.totalDifficult ?? 0)
      },
      {
        label: 'Gas Limit',
        tooltip: 'Total gas limit provided by all transactions in the block.',
        value: formatNum(data?.gasLimit ?? 0)
      },
      {
        label: 'Hash',
        tooltip: 'The hash of the block header of the current block.',
        value: data?.blockHash
      },
      {
        label: 'Parent Hash',
        tooltip: 'The hash of the block from which this block was generated, also known as its parent block.',
        value: <Link type={LinkTypeEnum.BLOCK} value={data?.parentHash || ''} />
      },
      {
        label: 'Extra Data',
        tooltip: 'Any data that can be included by the miner in the block.',
        value: data?.extraData
      },
      {
        label: 'Nonce',
        tooltip: 'Block nonce is a value used during mining to demonstrate proof of work for a block.',
        value: data?.nonce
      }
    ],
    [data?.blockHash, data?.extraData, data?.gasLimit, data?.nonce, data?.parentHash, data?.totalDifficult]
  )

  if (isLoading)
    return (
      <Container>
        <Loading />
      </Container>
    )

  return (
    <Container>
      <PageTitle
        title={
          <div className="flex items-center">
            <div>Block </div>
            <div className="ml-20px mr-12">#{convertNum(data?.blockNumber)}</div>
            <div className="flex items-center">
              <Space>
                <div className={classNames(style.arrowBtn, leftArrowBtnDisabled && style.disabled)} onClick={() => goBlockDetail(leftArrowBtnDisabled, -1)}>
                  <LeftOutlined />
                </div>
                <div className={classNames(style.arrowBtn, rightArrowBtnDisabled && style.disabled)} onClick={() => goBlockDetail(rightArrowBtnDisabled)}>
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
                <OverviewCards className="mb-24" data={overviewContent} />
                <div className="w-full border-1px border-solid border-border rounded-4">
                  <div className="p-24 border-b-1px border-solid border-border">
                    <div className="flex items-center mb-12">
                      <div className="text-20px font-500 mr-24">{convertNum(data?.blockNumber)}</div>
                      <L1StatusLine
                        l1Status={data?.l1Status}
                        l1CommitTransactionHash={data?.l1CommitTransactionHash}
                        l1FinalizeTransactionHash={data?.l1FinalizeTransactionHash}
                      />
                    </div>
                    <div className="flex items-center">
                      <div>
                        {transDisplayTimeAgo(data?.blockTime)} ({transDisplayTime(data?.blockTime)})
                      </div>
                      <div className="flexCenter ml-24">
                        <span>Validated by</span>
                        <Link className="mx-6px" type={LinkTypeEnum.ADDRESS} value={data?.validator || ''} />
                        <span>in {BLOCK_INTERVAL} secs</span>
                      </div>
                    </div>
                  </div>
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

export default BlockchainBlockDetail
