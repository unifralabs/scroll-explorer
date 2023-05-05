import { useCallback } from 'react'
import { Scrollbars } from 'react-custom-scrollbars'

import { Card, Col, Row, Tooltip } from 'antd'
import dayjs from 'dayjs'
import Image from 'next/image'

import Chart from '@/components/common/chart'
import Link from '@/components/common/link'
import Loading from '@/components/common/loading'
import SearchInput from '@/components/common/search-input'
import { L1StatusLabel } from '@/components/common/table-col-components'
import { BLOCK_INTERVAL, BROWSER_TITLE } from '@/constants'
import ROUTES from '@/constants/routes'
import { BlockType, LinkTypeEnum, TxType } from '@/types'
import { convertGwei, formatNumWithSymbol, getImgSrc, transDisplayNum, transDisplayTime, transDisplayTimeAgo } from '@/utils'
import { trpc } from '@/utils/trpc'

import style from './index.module.scss'

const HOME_LIST_SIZE = 10

// export async function getStaticProps(context: GetStaticPropsContext) {
//   const helpers = createServerSideHelpers({
//     router: appRouter,
//     ctx: {},
//     transformer: transformer
//   })
//   await helpers.summary.getAvgTps24h.prefetch()
//   await helpers.summary.getAvgPrice24h.prefetch()
//   await helpers.block.getFinalizedBlockHeight.prefetch()
//   await helpers.transaction.getTransactionCount.prefetch()
//   await helpers.stat.getDailyTxCount.prefetch({
//     timeStart: dayjs().subtract(15, 'day').unix(),
//     timeEnd: dayjs().unix()
//   })
//   await helpers.block.getBlockList.prefetch({ offset: 0, limit: HOME_LIST_SIZE })
//   await helpers.transaction.getTransactionList.prefetch({ limit: HOME_LIST_SIZE })
//   return {
//     props: {
//       trpcState: helpers.dehydrate()
//     },
//     revalidate: 1
//   }
// }

const Home: React.FC = () => {
  const { data: l2Tps } = trpc.summary.getAvgTps24h.useQuery()
  const { data: l2AvgGasPrice } = trpc.summary.getAvgPrice24h.useQuery()
  const { data: finalizedBlockHeight } = trpc.block.getFinalizedBlockHeight.useQuery()
  const { data: txCount } = trpc.transaction.getTransactionCount.useQuery()
  const { data: last14DaysTxCountStatisticsCount } = trpc.stat.getDailyTxCount.useQuery(
    {
      timeStart: dayjs().subtract(15, 'day').unix(),
      timeEnd: dayjs().unix()
    },
    { enabled: !!txCount }
  )

  const { isLoading: blockLoading, data: blockData } = trpc.block.getBlockList.useQuery(
    { offset: 0, limit: HOME_LIST_SIZE },
    { refetchInterval: BLOCK_INTERVAL * 1000 }
  )
  const { isLoading: txDataLoading, data: txData } = trpc.transaction.getTransactionList.useQuery(
    { limit: HOME_LIST_SIZE },
    { refetchInterval: BLOCK_INTERVAL * 1000 }
  )

  const iconRender = useCallback(({ iconName, title, content }: any) => {
    return (
      <div className="h-60px flex items-center">
        <div className="flex-1">
          <div className="text-secondText">{title}</div>
          <div className="font-bold text-16 mt-6px">{content}</div>
        </div>
        <div className="w-48px h-48px flexCenter rounded-full bg-lightMain ml-20px flexCenter">
          <Image height={24} src={getImgSrc(`home/${iconName}`)} alt="" />
        </div>
      </div>
    )
  }, [])

  const cellRender = useCallback(({ type = 'block', blockInfo, txInfo }: { type: 'block' | 'trans'; blockInfo?: BlockType; txInfo?: TxType }) => {
    const isBlock = 'block' === type

    return (
      <Row key={isBlock ? blockInfo?.blockHash : txInfo?.hash} className={style.cell} gutter={16}>
        <Col span={8}>
          <div className="flex items-center text-12">
            <div className={style.label}>{isBlock ? 'Bk' : 'Tx'}</div>
            <div>
              <Link
                className="mb-5px"
                type={isBlock ? LinkTypeEnum.BLOCK : LinkTypeEnum.TX}
                value={isBlock ? blockInfo?.blockNumber : txInfo?.hash}
                width={80}
                ellipsis>
                <div className="max-w-100px ellipsis">{isBlock ? blockInfo?.blockNumber : txInfo?.hash}</div>
              </Link>
              <div className="text-12">
                {
                  <Tooltip title={transDisplayTime(isBlock ? blockInfo?.blockTime : txInfo?.blockTime)}>
                    {transDisplayTimeAgo(isBlock ? blockInfo?.blockTime : txInfo?.blockTime)}
                  </Tooltip>
                }
              </div>
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div className="flex-1 text-12">
            <div className="flex items-end">
              <div className="mr-4px">{isBlock ? 'Validated By' : 'From'}</div>
              <Link type={LinkTypeEnum.ADDRESS} value={isBlock ? blockInfo?.validator : txInfo?.from} width={isBlock ? 80 : 120} ellipsis />
            </div>
            <div className="flex items-end">
              <div className="mr-4px">
                {isBlock ? (
                  <Link type={LinkTypeEnum.BLOCKS} value={blockInfo?.blockNumber} width="fit-content" ellipsis>
                    {blockInfo?.transactionCount} txns
                  </Link>
                ) : (
                  'To'
                )}
              </div>
              {isBlock ? (
                <div className="text-12">in {BLOCK_INTERVAL} secs</div>
              ) : (
                <Link type={LinkTypeEnum.ADDRESS} value={txInfo?.to} width={isBlock ? 80 : 120} ellipsis />
              )}
            </div>
          </div>
        </Col>
        <Col span={4} className="flexCenter">
          <L1StatusLabel l1Status={blockInfo?.l1Status ?? txInfo?.l1Status} showIcon={false} showBg={false} />
        </Col>
        <Col span={4} className="flex justify-end text-12">
          <div>{transDisplayNum({ num: isBlock ? blockInfo?.blockReward : txInfo?.value, fixedNum: 5 })}</div>
        </Col>
      </Row>
    )
  }, [])

  return (
    <>
      {(txDataLoading || blockLoading) && <Loading />}
      <div className={style.searchWrap}>
        <div>
          <div className="text-24px mb-20px">The {BROWSER_TITLE} Blockchain Explorer</div>
          <SearchInput />
        </div>
        <Image className="absolute right-60px bottom-0" width={400} src={getImgSrc('search_bg')} alt="" />
      </div>
      <div className="my-16px">
        <Row gutter={16}>
          <Col span={12}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card>{iconRender({ iconName: 'tps_icon', title: 'L2 TPS', content: <div>{l2Tps}</div> })}</Card>
              </Col>
              <Col span={12}>
                <Card>{iconRender({ iconName: 'trans_icon', title: 'TRANSACTIONS', content: <div>{formatNumWithSymbol(txCount)}</div> })}</Card>
              </Col>
              <Col span={12}>
                <Card>{iconRender({ iconName: 'gwei_icon', title: 'L2 AVG GAS PRICE', content: <div>{convertGwei(l2AvgGasPrice ?? 0)}</div> })}</Card>
              </Col>
              <Col span={12}>
                <Card>{iconRender({ iconName: 'block_icon', title: 'LAST FINALIZED BLOCK', content: <div>{finalizedBlockHeight}</div> })}</Card>
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Card className="h-full" bodyStyle={{ height: '100%' }}>
              <div className="text-secondText mb-10px">TRANSACTION HISTORY IN 14 DAYS</div>
              <div className="w-full h-[calc(100%-32px)]">
                <Chart
                  xDataKey="date"
                  yDataKey="count"
                  xPanding={{ left: 0, right: 0 }}
                  yWidth={45}
                  data={last14DaysTxCountStatisticsCount || []}
                  tooltipTitle="Transactions"
                  dot={false}
                  showGrid={true}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      <Row gutter={16}>
        {[
          { title: 'Blocks', type: 'block', href: ROUTES.BLOCK_CHAIN.BLOCKS, listData: blockData?.list },
          { title: 'Transactions', type: 'trans', href: ROUTES.BLOCK_CHAIN.TXNS, listData: txData?.list }
        ].map(({ title, type, href, listData }: any) => (
          <Col key={type} span={12}>
            <Card
              className="min-h-404px h-[calc(100vh-536px)]"
              title={
                <div className="flex justify-between items-center">
                  <span>Latest {title}</span>
                  <a className="text-14" href={href}>
                    <b>View all</b>
                  </a>
                </div>
              }
              headStyle={{ border: 'none' }}
              bodyStyle={{ height: 'calc(100% - 57px)', padding: 0 }}>
              <div className={style.listWrap}>
                <Scrollbars universal={true} autoHide>
                  {listData?.map((data: any) =>
                    cellRender({
                      type,
                      blockInfo: 'block' === type ? data : undefined,
                      txInfo: 'block' === type ? undefined : data
                    })
                  )}
                </Scrollbars>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default Home
