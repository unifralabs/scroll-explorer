import { CSSProperties, ReactNode } from 'react'
import { generatePath } from 'react-router-dom'

import { getAddress, isAddress } from '@ethersproject/address'
import { Tooltip } from 'antd'
import classNames from 'classnames'
import Image from 'next/image'

import ROUTES from '@/constants/routes'
import { LinkTypeEnum } from '@/types'
import { getCrossBrowserTxUrl, stringifyQueryUrl } from '@/utils'

type LinkPropsType = {
  style?: CSSProperties
  className?: string
  type: LinkTypeEnum
  value: string | number | undefined | null
  children?: ReactNode
  ellipsis?: boolean
  width?: number | string
  target?: string
}

export const getLinkRoute = (type: LinkTypeEnum | undefined, value: any = '') => {
  const _value = isAddress(value) ? getAddress(value) : value

  switch (type) {
    case LinkTypeEnum.BLOCK:
      return generatePath(ROUTES.BLOCK_CHAIN.DETAIL.BLOCK, { block: _value })

    case LinkTypeEnum.BLOCKS:
      // TODO: is this wrong?
      return stringifyQueryUrl(ROUTES.BLOCK_CHAIN.TXNS, { block: _value })

    case LinkTypeEnum.BATCH:
      return generatePath(ROUTES.BLOCK_CHAIN.DETAIL.BATCH, { batch: _value })

    case LinkTypeEnum.BATCHES:
      return stringifyQueryUrl(ROUTES.BLOCK_CHAIN.BATCHES, { batch: _value })

    case LinkTypeEnum.CONTRACT_INTERNAL_TXS:
      return stringifyQueryUrl(ROUTES.BLOCK_CHAIN.TXNS, { internalBlock: _value })

    case LinkTypeEnum.TX:
      return generatePath(ROUTES.BLOCK_CHAIN.DETAIL.TX, { tx: _value })

    case LinkTypeEnum.CONTRACT:
      return generatePath(ROUTES.BLOCK_CHAIN.DETAIL.ADDRESS, { address: _value })

    case LinkTypeEnum.ADDRESS:
      return generatePath(ROUTES.BLOCK_CHAIN.DETAIL.ADDRESS, { address: _value })

    case LinkTypeEnum.TOKEN:
      return generatePath(ROUTES.BLOCK_CHAIN.DETAIL.TOKEN, { token: _value })

    case LinkTypeEnum.CROSS_BROWSER_TX:
      return getCrossBrowserTxUrl(_value)

    default:
      return ROUTES.HOME
  }
}

const Link: React.FC<LinkPropsType> = ({ style = {}, className = '', type, value, children, ellipsis = false, width = 150, target }) => {
  const _value: any = children ?? value
  const data = isAddress(_value || '') ? getAddress(_value || '') : _value
  if (!data) {
    return <div>-</div>
  }

  return (
    <a
      style={style}
      className={className}
      href={getLinkRoute(type, isAddress((value as any) || '') ? getAddress((value as any) || '') : value)}
      target={target}>
      <Tooltip title={[LinkTypeEnum.BLOCK, LinkTypeEnum.BLOCKS].includes(type) ? undefined : data} placement="topLeft">
        {ellipsis ? (
          <div style={{ width: `${width}px` }} className="ellipsis">
            {data}
          </div>
        ) : (
          data
        )}
      </Tooltip>
    </a>
  )
}

export default Link

export const TokenLink: React.FC<{
  className?: string
  name?: string
  symbol?: string
  tokenAddress: string
  ellipsis?: boolean
  img?: string
  imgSize?: number
  imgLineHeight?: number
  desc?: string
}> = ({ className = '', name = '', symbol = '', tokenAddress, ellipsis = false, img, imgSize = 18, desc = '' }) => {
  return (
    <>
      <div className={classNames('flex items-center', className)}>
        {!!img && <Image className="mr-8px mb-1px" width={imgSize} height={imgSize} src={img} alt="" />}
        <Link type={LinkTypeEnum.TOKEN} value={tokenAddress} ellipsis={!!name || !!symbol ? false : ellipsis}>
          {!!name || !!symbol ? `${name}${!!name && !!symbol ? ' (' : ''}${symbol}${!!name && !!symbol ? ')' : ''}` : tokenAddress}
        </Link>
      </div>
      {!!desc && (
        <div style={{ paddingLeft: `${imgSize + 8}px` }} className="text-12 text-[#999] mt-2px max-w-800px break-words">
          {desc}
        </div>
      )}
    </>
  )
}
