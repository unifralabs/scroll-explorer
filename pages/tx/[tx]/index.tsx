import { useMemo } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

import { ClockCircleOutlined, CopyOutlined, FieldTimeOutlined } from '@ant-design/icons'
import SyncOutlined from '@ant-design/icons/lib/icons/SyncOutlined'
import { Col, Row } from 'antd'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'

import TxInternalDetailTable from '@/components/blockchain/tx-internal-detail-table'
import Link from '@/components/common/link'
import Loading from '@/components/common/loading'
import { OverviewCards, OverviewCellContent, OverviewCellContentType } from '@/components/common/overview-content'
import PageTitle from '@/components/common/page-title'
import TabCard, { TabCardListProps } from '@/components/common/tab-card'
import { L1StatusLine, TextAreaRow, TokensOrCrossTransferredRow, TxStatusLabel } from '@/components/common/table-col-components'
import { TIPS } from '@/constants'
import Container from '@/layout/container'
import { LinkTypeEnum, TxLogItemType } from '@/types'
import { convertGwei, convertNum, formatNum, getImgSrc, transDisplayNum, transDisplayTime, transDisplayTimeAgo } from '@/utils'
import message from '@/utils/message'
import { trpc } from '@/utils/trpc'

const labelClassName = 'text-right text-secondText'
const renderLogsItem = ({ logIndex, address, topics, data, eventFullName }: TxLogItemType) => (
  <div className="flex p-16px bg-[#fafafa] rounded-4">
    <div className="w-40px h-40px rounded-full text-green bg-lightGreen flexCenter mr-24">{convertNum(logIndex)}</div>
    <div className="flex-1">
      <Row className="mb-14px" gutter={18}>
        <Col span={2} className={`font-bold ${labelClassName}`}>
          Address
        </Col>
        <Col span={22}>
          <Link type={LinkTypeEnum.ADDRESS} value={address} />
        </Col>
      </Row>
      {!!eventFullName && (
        <Row className="mb-14px" gutter={18}>
          <Col span={2} className={labelClassName}>
            Name
          </Col>
          <Col span={22} dangerouslySetInnerHTML={{ __html: eventFullName }}></Col>
        </Row>
      )}
      <Row className="mb-14px" gutter={18}>
        <Col span={2} className={labelClassName}>
          Topics
        </Col>
        <Col span={22}>
          {topics?.map((topic, index) => (
            <div key={index} className={classNames('flex items-center', !!index && 'mt-8px')}>
              <div className="px-8px py-3px rounded-4 text-12 bg-[#eee] text-secondText mr-8px">{index}</div>
              <div>{topic}</div>
            </div>
          ))}
        </Col>
      </Row>
      <Row gutter={18}>
        <Col span={2} className={`italic ${labelClassName} mb-0`}>
          Data
        </Col>
        <Col span={22}>
          <div className="bg-[#eee] flex justify-between items-end p-12 rounded-4">
            <div className="break-all mr-12">{data}</div>
            <div></div>
          </div>
        </Col>
      </Row>
    </div>
  </div>
)

const BlockchainTxDetail: React.FC = () => {
  const router = useRouter()
  const search: any = router?.query
  const { tx } = search
  const { isLoading: isTxDetailLoading, data: txDetail } = trpc.transaction.getTransactionDetail.useQuery(tx, { enabled: !!tx })
  const { isLoading: isTxLogsLoading, data: txLogs } = trpc.transaction.getTransactionLogs.useQuery(tx, { enabled: !!tx })

  const isPendingTx = useMemo(() => null === txDetail?.blockNumber, [txDetail?.blockNumber])
  const hasLogs = useMemo(() => !!txLogs, [txLogs])

  const overviewContent = useMemo(
    () => [
      {
        img: 'value',
        content: [
          {
            tooltip:
              'The value being transacted in Ether and fiat value. Note: You can click the fiat value (if available) to see historical value at the time of transaction.',
            label: 'Value',
            value: transDisplayNum({ num: txDetail?.value, fixedNum: 6 })
          }
        ]
      },
      {
        img: 'fee',
        content: [
          {
            tooltip: 'Amount paid to the miner for processing the transaction.',
            label: 'Transaction Fee',
            value: transDisplayNum({ num: txDetail?.fee, fixedNum: 9 })
          }
        ]
      },
      {
        img: 'gas_price',
        content: [
          {
            tooltip:
              'Cost per unit of gas specified for the transaction, in Ether and Gwei. The higher the gas price the higher chance of getting included in a block.',
            label: 'Gas Price',
            value: convertGwei(txDetail?.gasPrice)
          }
        ]
      },
      {
        img: 'gas_limit',
        content: [
          {
            tooltip: 'Maximum amount of gas allocated for the transaction.',
            label: 'Gas Limit',
            value: formatNum(txDetail?.gasLimit ?? 0)
          }
        ]
      }
    ],
    [txDetail?.fee, txDetail?.gasLimit, txDetail?.gasPrice, txDetail?.value]
  )

  const cellContent = useMemo(() => {
    const cols: OverviewCellContentType = [
      {
        label: 'Result',
        tooltip: 'The result of the transaction.',
        value: <TxStatusLabel status={Number(txDetail?.status)} errorInfo={txDetail?.errorInfo} />
      },
      {
        colSpan: 24,
        label: 'L1 Status',
        tooltip: 'The zkproof status of the l2 block.',
        value: (
          <L1StatusLine
            lineWidth={100}
            l1Status={txDetail?.l1Status}
            l1CommitTransactionHash={txDetail?.l1CommitTransactionHash}
            l1FinalizeTransactionHash={txDetail?.l1FinalizeTransactionHash}
          />
        )
      },
      ...(isPendingTx
        ? [
            {
              label: 'Time Last Seen',
              tooltip: 'The time when the transaction is last seen in the network pool.',
              value: (
                <div>
                  <ClockCircleOutlined className="mr-6px" />
                  {transDisplayTimeAgo(txDetail?.lastSeen)} ({transDisplayTime(txDetail?.lastSeen)})
                </div>
              )
            },
            {
              label: 'Time First Seen',
              tooltip: 'The time when the transaction is first seen in the network pool.',
              value: (
                <div>
                  <ClockCircleOutlined className="mr-6px" />
                  {transDisplayTimeAgo(txDetail?.firstSeen)} ({transDisplayTime(txDetail?.firstSeen)})
                </div>
              )
            }
          ]
        : []),
      {
        label: 'From',
        tooltip: 'The sending party of the transaction.',
        value: (
          <div className="flex items-center">
            <Link type={LinkTypeEnum.ADDRESS} value={txDetail?.from} />
            <CopyToClipboard text={txDetail?.from ?? ''} onCopy={() => message.success(TIPS.copied)}>
              <CopyOutlined className="ml-4px text-12 cursor-pointer" />
            </CopyToClipboard>
          </div>
        )
      },
      {
        label: 'To',
        tooltip: 'The receiving party of the transaction (could be a contract address).',
        value: (
          <div className="flex items-center">
            <Link type={LinkTypeEnum.ADDRESS} value={txDetail?.to} />
            <CopyToClipboard text={txDetail?.to ?? ''} onCopy={() => message.success(TIPS.copied)}>
              <CopyOutlined className="ml-4px text-12 cursor-pointer" />
            </CopyToClipboard>
          </div>
        )
      },
      ...(2 === txDetail?.transactionType
        ? [
            {
              label: 'Gas Fees',
              tooltip:
                'Base Fee refers to the network Base Fee at the time of the block, while Max Fee & Max Priority Fee refer to the max amount a user is willing to pay for their tx & to give to the miner respectively.',
              value: (
                <div className="flex items-center">
                  <span className="text-secondText mr-6px">Base:</span>
                  <span>{convertGwei(new BigNumber(txDetail?.gasPrice ?? 0).minus(new BigNumber(txDetail?.maxPriority ?? 0)).toString())}</span>
                  <div className="w-1px h-10px bg-secondText mx-15px"></div>
                  <span className="text-secondText mr-6px">Max:</span>
                  <span>{convertGwei(txDetail?.maxFee)}</span>
                  <div className="w-1px h-10px bg-secondText mx-15px"></div>
                  <span className="text-secondText mr-6px">Max Priority:</span>
                  <span>{convertGwei(txDetail?.maxPriority)}</span>
                </div>
              )
            }
          ]
        : []),

      {
        label: 'Nonce',
        tooltip: 'Transaction number from the sending address. Each transaction sent from an address increments the nonce by 1.',
        value: txDetail?.nonce ?? '-'
      },
      {
        label: 'Position in block',
        tooltip: 'Index position of Transaction in the block.',
        value: txDetail?.transactionIndex ?? '-'
      },
      {
        colSpan: 24,
        label: 'Input Data',
        tooltip: 'Additional data included for this transaction. Commonly used as part of contract interaction or as a message sent to the recipient.',
        value: <TextAreaRow value={txDetail?.inputData} />
      }
    ]

    // Token Transfer Item
    if (!!txDetail?.tokenTransfer?.length) {
      cols.splice(-3, 0, {
        colSpan: 24,
        label: 'Tokens Transferred',
        tooltip: 'List of tokens transferred in the transaction.',
        value: <TokensOrCrossTransferredRow data={txDetail?.tokenTransfer} />
      })
    }

    // Cross Transfer Item
    if (!!txDetail?.crossTransfer?.length) {
      cols.splice(-3, 0, {
        colSpan: 24,
        label: 'Cross Transferred',
        tooltip: 'List of cross transferred in the transaction.',
        value: <TokensOrCrossTransferredRow data={txDetail?.crossTransfer} />
      })
    }

    return cols
  }, [txDetail, isPendingTx])

  const overviewTab = useMemo(
    () => (
      <div>
        <OverviewCards className="mb-24" data={overviewContent} />
        <div className="w-full border-1px border-solid border-border rounded-4">
          <div className="p-24">
            {isPendingTx ? <SyncOutlined className="mr-6px" spin /> : <FieldTimeOutlined className="mr-6px" />}
            {transDisplayTimeAgo(txDetail?.blockTime)} ({transDisplayTime(txDetail?.blockTime)})
          </div>
          <div className="flex p-24 pt-0 border-b-1px border-solid border-border">
            <div className="mr-24">
              <div className="flex flex-col">
                <div className="mb-12">Transaction Hash</div>
                <CopyToClipboard text={txDetail?.hash ?? ''} onCopy={() => message.success(TIPS.copied)}>
                  <div className="text-20px font-500 mr-10px text-main cursor-pointer">{txDetail?.hash}</div>
                </CopyToClipboard>
              </div>
            </div>
            <div>
              <div className="mb-12">Block</div>
              <Link className="text-20px font-500" type={LinkTypeEnum.BLOCK} value={convertNum(txDetail?.blockNumber)} />
            </div>
          </div>
          <div className="p-24">
            <OverviewCellContent data={cellContent} />
          </div>
        </div>
      </div>
    ),
    [cellContent, isPendingTx, overviewContent, txDetail?.blockNumber, txDetail?.blockTime, txDetail?.hash]
  )

  const tabs = useMemo(() => {
    const data: TabCardListProps = []

    // Internal Txns Tab
    data.push({
      label: 'Internal Txns',
      children: <TxInternalDetailTable from={txDetail?.from ?? ''} to={txDetail?.to ?? ''} tx={tx} />
    })

    // Logs Tab
    if (hasLogs) {
      data.push({
        label: `Logs (${txLogs?.length})`,
        children: (
          <div>
            {txLogs?.map((item, index) => (
              <div key={index}>
                {!!!index && (
                  <div className="text-[#666] mb-12 flex items-center">
                    <Image className="mr-12" width={14} src={getImgSrc('overview/logs_icon')} alt="" />
                    <span>Transaction Receipt Event Logs</span>
                  </div>
                )}
                {renderLogsItem(item as any)}
              </div>
            ))}
          </div>
        )
      })
    }

    return data
  }, [hasLogs, txDetail?.from, txDetail?.to, txLogs, tx])

  if (isTxDetailLoading) {
    return (
      <Container>
        <PageTitle title="Transaction Details" />
        <Loading />
      </Container>
    )
  }

  return (
    <Container>
      <PageTitle title="Transaction Details" />
      <TabCard
        tabList={[
          {
            label: 'Overview',
            children: overviewTab
          },
          ...tabs
        ]}
      />
    </Container>
  )
}

export default BlockchainTxDetail
