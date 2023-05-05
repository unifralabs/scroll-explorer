import React, { CSSProperties, useCallback, useMemo } from 'react'

import { CaretRightOutlined, CheckCircleFilled, ClockCircleFilled, CloseCircleFilled, ExclamationCircleFilled, SwapRightOutlined } from '@ant-design/icons'
import CheckedSvg from '@svgs/checked.svg'
import CheckingSvg from '@svgs/checking.svg'
import TimeSvg from '@svgs/time.svg'
import { Input, Tooltip } from 'antd'
import classNames from 'classnames'

import Link, { TokenLink } from '@/components/common/link'
import {
  CrossTransferItemType,
  L1StatusType,
  L1StatusTypeEnum,
  LinkTypeEnum,
  TokensTransferItemType,
  TxCrossTransferType,
  TxStatusType,
  TxStatusTypeEnum
} from '@/types'
import { getCrossBrowserTxUrl, transDisplayNum } from '@/utils'

import style from './index.module.scss'

export const TransArrowIcon: React.FC = () => (
  <div className="w-20px h-20px rounded-full flexCenter bg-lightMain">
    <SwapRightOutlined className="text-12" />
  </div>
)

export const MethodLabel: React.FC<{ method: string | undefined }> = ({ method }) => (
  <Tooltip title={method}>
    <div className="max-w-122px px-6px py-4px bg-[#eee] text-12 rounded-4 text-center ellipsis">{method || '-'}</div>
  </Tooltip>
)

export const L1StatusLabel: React.FC<{
  style?: CSSProperties
  className?: string
  l1Status: L1StatusTypeEnum | undefined
  l1CommitTransactionHash?: string | undefined | null
  l1FinalizeTransactionHash?: string | undefined | null
  showIcon?: boolean
  showLabel?: boolean
  showBg?: boolean
  iconWidth?: number
  iconHeight?: number
}> = ({
  style: myStyle,
  className = '',
  l1Status,
  l1CommitTransactionHash,
  l1FinalizeTransactionHash,
  showIcon = true,
  showLabel = true,
  showBg = true,
  iconWidth = 16,
  iconHeight = 16
}) => {
  const link = l1CommitTransactionHash || l1FinalizeTransactionHash || ''
  const hasLink =
    (L1StatusTypeEnum.COMMITTED === l1Status && !!l1CommitTransactionHash) || (L1StatusTypeEnum.FINALIZED === l1Status && !!l1FinalizeTransactionHash)

  // wrap color
  let wrapColorClass = 'leading-16px font-400'
  if (L1StatusTypeEnum.FINALIZED === l1Status) {
    showBg && (wrapColorClass += ' bg-lightGreen')
  }
  if (L1StatusTypeEnum.COMMITTED === l1Status) {
    showBg && (wrapColorClass += ' bg-lightOrange')
  }
  if (L1StatusTypeEnum.UNCOMMITTED === l1Status) {
    showBg && (wrapColorClass += ' bg-[#eee]')
  }
  if (L1StatusTypeEnum.SKIPPED === l1Status) {
    showBg && (wrapColorClass += ' bg-pink-100')
  }

  // wrap hover color
  let wrapHoverColorClass = ''
  if (showBg && hasLink) {
    wrapHoverColorClass += `cursor-pointer transition-all hover:text-white`
    L1StatusTypeEnum.FINALIZED === l1Status && (wrapHoverColorClass += ' hover:bg-[#00c29eb3]')
    L1StatusTypeEnum.COMMITTED === l1Status && (wrapHoverColorClass += ' hover:bg-[#f9761ab3]')
  }

  // icon props
  const getIconProps = useMemo(
    () => ({
      width: iconWidth,
      height: iconHeight,
      className: classNames(showLabel && 'mr-6px', hasLink && 'transition-all')
    }),
    [hasLink, iconHeight, iconWidth, showLabel]
  )

  const label = useMemo(() => (undefined === l1Status ? '-' : L1StatusType?.[l1Status]), [l1Status])

  return (
    <Tooltip title={!showLabel ? `L1 Status: ${label}` : undefined}>
      <div
        style={myStyle}
        className={classNames(className, wrapColorClass, wrapHoverColorClass, showBg && 'w-120px pl-9px py-4px rounded-4', 'text-12 flex items-center')}
        onClick={() => !!link && window.open(getCrossBrowserTxUrl(link))}>
        {showIcon && L1StatusTypeEnum.FINALIZED === l1Status && <CheckedSvg {...getIconProps} />}

        {showIcon && L1StatusTypeEnum.COMMITTED === l1Status && <CheckingSvg {...getIconProps} />}

        {showIcon && L1StatusTypeEnum.UNCOMMITTED === l1Status && <TimeSvg {...getIconProps} />}

        {showIcon && L1StatusTypeEnum.SKIPPED === l1Status && <ExclamationCircleFilled className="text-pink-300 mr-6px text-16" />}

        {showLabel && <span>{label}</span>}
      </div>
    </Tooltip>
  )
}

export const L1StatusLine: React.FC<{
  lineWidth?: number
  l1Status?: L1StatusTypeEnum | undefined
  l1CommitTransactionHash?: string | undefined | null
  l1FinalizeTransactionHash?: string | undefined | null
}> = ({ lineWidth = 36, l1Status, l1CommitTransactionHash, l1FinalizeTransactionHash }) => {
  const renderLine = useCallback(
    (showGreen: boolean) => <div style={{ width: `${lineWidth}px` }} className={classNames('mx-16px h-2px', showGreen ? 'bg-green' : 'bg-[#C0C6CC]')}></div>,
    [lineWidth]
  )

  const link = l1CommitTransactionHash || l1FinalizeTransactionHash || ''
  const hasLink = useMemo(
    () => (L1StatusTypeEnum.COMMITTED === l1Status && !!l1CommitTransactionHash) || (L1StatusTypeEnum.FINALIZED === l1Status && !!l1FinalizeTransactionHash),
    [l1CommitTransactionHash, l1FinalizeTransactionHash, l1Status]
  )

  const svgWrapClass = useMemo(() => `flex items-center font-400${hasLink ? ' cursor-pointer' : ''}`, [hasLink])

  const goHref = useCallback(() => !!link && window.open(getCrossBrowserTxUrl(link)), [link])

  return (
    <div className="flex items-center">
      <div className={classNames(svgWrapClass)}>
        <TimeSvg className={style.activeL1StatusLineTimeSvg} />
        <div className="ml-4px">Pending</div>
      </div>
      {renderLine(true)}
      <div className={classNames(svgWrapClass, undefined === l1Status && style.inActiveL1StatusLineSvgWrap)}>
        <CheckedSvg />
        <div className="ml-4px">Succeed on L2</div>
      </div>
      {renderLine(undefined !== l1Status)}
      <div className={classNames(svgWrapClass, L1StatusTypeEnum.UNCOMMITTED === l1Status && style.inActiveL1StatusLineSvgWrap)} onClick={goHref}>
        <CheckedSvg />
        <div className="ml-4px">Committed on L1</div>
      </div>
      {renderLine(L1StatusTypeEnum.FINALIZED === l1Status)}
      <div className={classNames(svgWrapClass, L1StatusTypeEnum.FINALIZED !== l1Status && style.inActiveL1StatusLineSvgWrap)} onClick={goHref}>
        <CheckedSvg />
        <div className="ml-4px">Finalized</div>
      </div>
    </div>
  )
}

export const TxStatusLabel: React.FC<{ status: TxStatusTypeEnum | undefined; errorInfo?: string }> = ({ status, errorInfo }) => (
  <Tooltip title={errorInfo}>
    <div
      className={classNames(
        undefined === status && 'bg-[#77838f1a] text-secondText',
        TxStatusTypeEnum.SUCCEED === status && 'bg-lightGreen text-green',
        TxStatusTypeEnum.FAILED === status && 'bg-lightRed text-red',
        'w-fit rounded-4 py-4px px-10px text-12'
      )}>
      {/* pending */}
      {undefined === status && <ClockCircleFilled className="text-12 mr-4px text-[#999]" />}

      {/* success */}
      {TxStatusTypeEnum.SUCCEED === status && <CheckCircleFilled className="text-12 mr-4px text-green" />}

      {/* failed */}
      {TxStatusTypeEnum.FAILED === status && <CloseCircleFilled className="text-12 mr-4px text-red" />}

      {undefined !== status ? TxStatusType?.[status] : 'Pending'}
    </div>
  </Tooltip>
)

export const TokensOrCrossTransferredRow: React.FC<{ data: Partial<TokensTransferItemType & CrossTransferItemType>[] | undefined }> = ({ data }) => (
  <>
    {data?.map((item, index) => (
      <div key={index} className="flex items-center mb-4px last:mb-0">
        <CaretRightOutlined className="text-12 mr-6px" />
        <span className="font-bold mr-6px">From</span>
        <Link type={LinkTypeEnum.ADDRESS} value={item?.from || item?.from_} ellipsis />
        <span className="font-bold mx-6px">To</span>
        <Link type={LinkTypeEnum.ADDRESS} value={item?.to} ellipsis />
        <span className="font-bold mx-6px">For</span>
        <span className="mr-8px">{transDisplayNum({ num: item?.value ?? item?.amount, suffix: '', decimals: item?.decimals ?? 0 })}</span>
        <TokenLink name={item?.name} symbol={item?.symbol} tokenAddress={item?.contract || item?.l2Token || ''} img={item?.logo_path} ellipsis />
        {!!item?.l1TransactionHash && (
          <>
            <div className="w-70px h-22px flexCenter bg-lightGreen text-green text-12 rounded-4 text-center mx-6">
              {undefined !== item?.type ? TxCrossTransferType[item?.type] : '-'}
            </div>
            <a href={getCrossBrowserTxUrl(item?.l1TransactionHash)} target="_blank" rel="noreferrer">
              l1Transaction
            </a>
          </>
        )}
      </div>
    ))}
  </>
)

export const TextAreaRow: React.FC<{ style?: CSSProperties; className?: string; value?: string | undefined | null; maxRows?: number }> = ({
  style: _style = {},
  className = '',
  value = '',
  maxRows = 14
}) => (
  <Input.TextArea
    style={_style}
    className={classNames(className, 'bg-[#f8f9fa] text-12 px-12 py-8px')}
    value={value || ''}
    autoSize={{ maxRows }}
    readOnly></Input.TextArea>
)
