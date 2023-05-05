import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { generatePath } from 'react-router-dom'

import { Card } from 'antd'
import Image from 'next/image'
import { useRouter } from 'next/router'

import PageTitle from '@/components/common/page-title'
import { BROWSER_TITLE } from '@/constants'
import ROUTES from '@/constants/routes'
import Container from '@/layout/container'
import { getImgSrc } from '@/utils'

export enum ChartTypeEnum {
  TX = 'tx',
  ERC2ETXNS = 'erc2etxns',
  ADDRESS = 'address'
}

export const chartTitle: any = {
  [ChartTypeEnum.TX]: {
    title: 'Daily Transactions Chart',
    tip: `The chart highlights the total number of transactions on the ${BROWSER_TITLE} blockchain.`
  },
  [ChartTypeEnum.ERC2ETXNS]: {
    title: 'ERC-20 Daily Token Transfer Chart',
    tip: 'The chart shows the number of ERC20 tokens transferred daily.'
  },
  [ChartTypeEnum.ADDRESS]: {
    title: 'Unique Addresses Chart',
    tip: `The chart shows the total distinct numbers of address on the ${BROWSER_TITLE} blockchain.`
  }
}

const cardData: any = [
  { type: ChartTypeEnum.TX, img: 'line' },
  { type: ChartTypeEnum.ERC2ETXNS, img: 'line' },
  { type: ChartTypeEnum.ADDRESS, img: 'area' }
]

const Charts: React.FC = () => {
  const router = useRouter()
  const ref: any = useRef(null)

  const [height, setHeight] = useState(0)

  const changeImgSize = useCallback(() => setHeight((ref?.current?.offsetWidth / 940) * 504), [])

  useLayoutEffect(() => {
    changeImgSize()
  }, [changeImgSize])

  useEffect(() => {
    window.addEventListener('resize', changeImgSize)
    return () => {
      window.removeEventListener('resize', changeImgSize)
    }
  }, [changeImgSize])

  return (
    <Container>
      <PageTitle title="Resources" />
      <Card className="h-[calc(100vh-152px)] min-h-358px" title="Blockchain Data">
        <div className="grid grid-cols-3 gap-16">
          {cardData?.map(({ type, img }: any) => (
            <div
              key={chartTitle[type]?.title}
              className="px-16px py-14px border-1px border-solid border-border cursor-pointer rounded-8"
              onClick={() => router.push(generatePath(ROUTES.CHARTS.DETAIL, { chart: type }))}>
              <div className="text-[#666] font-400 mb-12">{chartTitle[type]?.title}</div>
              <div ref={ref} style={{ height: `${height}px` }} className="w-full flexCenter relative">
                <Image src={getImgSrc(`charts/${img}`)} alt="" objectFit="contain" fill />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Container>
  )
}

export default Charts
