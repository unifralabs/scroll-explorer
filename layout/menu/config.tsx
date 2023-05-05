import { ReactNode } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import BlockchainSvg from '@svgs/blockchain.svg'
import HomeSvg from '@svgs/home.svg'
import ResourceSvg from '@svgs/resource.svg'
import TokenSvg from '@svgs/token.svg'
import VerifySvg from '@svgs/verify.svg'

import ROUTES from '@/constants/routes'

import style from './index.module.scss'

type RouteMenuType = {
  label: string
  key?: string
  route?: string
  icon: ReactNode
  children?: { label: string; route: string }[]
}[]

export const ROUTES_MENUS: RouteMenuType = [
  {
    label: 'Home',
    route: ROUTES.HOME,
    icon: <HomeSvg />
  },
  {
    label: 'Blockchain',
    icon: <BlockchainSvg className={style.blockChainSvg} />,
    children: [
      { label: 'Transactions', route: ROUTES.BLOCK_CHAIN.TXNS },
      { label: 'Blocks', route: ROUTES.BLOCK_CHAIN.BLOCKS },
      { label: 'Batches', route: ROUTES.BLOCK_CHAIN.BATCHES }
    ]
  },
  {
    label: 'Tokens',
    icon: <TokenSvg className={style.tokenSvg} />,
    children: [
      { label: 'ERC 20', route: ROUTES.TOKENS.ERC20 },
      { label: 'ERC 721', route: ROUTES.TOKENS.ERC721 },
      { label: 'ERC 1155', route: ROUTES.TOKENS.ERC1155 }
    ]
  },
  {
    label: 'Resources',
    icon: <ResourceSvg />,
    route: ROUTES.CHARTS.INDEX
  },
  {
    label: 'Verify contract',
    icon: <VerifySvg />,
    route: ROUTES.CONTRACT.VERIFY
  },
  {
    label: 'About US',
    icon: <InfoCircleOutlined style={{ fontSize: '16px' }} />,
    route: 'https://unifra.io/'
  }
]
