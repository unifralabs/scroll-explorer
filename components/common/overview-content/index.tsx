import { ReactNode } from 'react'

import { Col, Row, Tooltip } from 'antd'
import Image from 'next/image'

import { getImgSrc } from '@/utils'

type OverviewCardsProps = {
  className?: string
  data: {
    img: string
    content: {
      label: string
      value: string | ReactNode
      tooltip?: string
    }[]
    colSpan?: number
  }[]
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ className = '', data }) => (
  <Row className={className} gutter={16}>
    {data?.map(({ img, content, colSpan = 6 }) => (
      <Col key={img} span={colSpan}>
        <div className="border-1px border-solid border-border rounded-4 flex justify-between items-center p-16px">
          <div className="flex-1 flex mr-[3%]">
            {content?.map(({ label, value, tooltip }, index) => (
              <div className={!!index ? 'ml-[7%]' : ''} key={label}>
                <div className="flex items-center text-[#666] mb-4px whitespace-nowrap">
                  {label}
                  {!!tooltip && (
                    <Tooltip title={tooltip}>
                      <Image className="cursor-pointer ml-[4%]" width={14} src={getImgSrc('qa')} alt="" />
                    </Tooltip>
                  )}
                </div>
                <div className="font-bold">{value}</div>
              </div>
            ))}
          </div>
          <Image width={36} src={getImgSrc(`overview/${img}`)} alt="" />
        </div>
      </Col>
    ))}
  </Row>
)

export type OverviewCellContentType = {
  label: string
  tooltip?: string | undefined
  value: string | ReactNode | undefined
  colSpan?: number | undefined
}[]

type OverviewCellContentProps = {
  className?: string
  data: OverviewCellContentType
}

export const OverviewCellContent: React.FC<OverviewCellContentProps> = ({ className = '', data }) => (
  <Row className={className} gutter={[32, 32]}>
    {data?.map(({ label, tooltip, value, colSpan = 12 }) => (
      <Col key={label} span={colSpan}>
        <div className="flex items-center mb-6px">
          <div className="text-[#666]">{label}:</div>
          {!!tooltip && (
            <Tooltip title={tooltip}>
              <Image className="cursor-pointer ml-6px" width={14} src={getImgSrc('qa')} alt="" />
            </Tooltip>
          )}
        </div>
        <div className="font-500 break-words">{value}</div>
      </Col>
    ))}
  </Row>
)
