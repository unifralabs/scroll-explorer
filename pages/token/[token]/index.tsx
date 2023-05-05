import { useMemo, useState } from 'react'

import { LoadingOutlined } from '@ant-design/icons'
import { getAddress, isAddress } from '@ethersproject/address'
import { Card } from 'antd'
import Image from 'next/image'
import { useRouter } from 'next/router'

import Link from '@/components/common/link'
import { OverviewCards } from '@/components/common/overview-content'
import PageTitle from '@/components/common/page-title'
import TabCard from '@/components/common/tab-card'
import ContractTab, { ContractTabTitle } from '@/components/contract/contract-tab'
import TokenDetailHoldersTable from '@/components/tokens/token-detail-holders-table'
import TokenDetailTxsTable from '@/components/tokens/token-detail-txs-table'
import Container from '@/layout/container'
import { ContractDetailType, LinkTypeEnum } from '@/types'
import { formatNum, transDisplayNum } from '@/utils'
import { trpc } from '@/utils/trpc'

const BlockchainTokenDetail: React.FC = () => {
  const router = useRouter()
  const search: any = router?.query
  const token = isAddress(search?.token) ? getAddress(search?.token) : search?.token
  const { data: tokenDetail } = trpc.token.getTokenDetail.useQuery(token, { enabled: !!token })
  const { data: contractDetail } = trpc.contract.getContractDetail.useQuery(token, { enabled: !!token })

  const [transCount, setTransCount] = useState(0)

  const overviewContent = useMemo(
    () => [
      {
        img: 'supply',
        content: [
          {
            label: 'Max Total Supply',
            value: tokenDetail?.totalSupply ? (
              transDisplayNum({ num: tokenDetail?.totalSupply ?? 0, decimals: tokenDetail?.decimals, suffix: '' })
            ) : (
              <LoadingOutlined />
            )
          }
        ]
      },
      {
        img: 'holders',
        content: [{ label: 'Holders', value: tokenDetail?.holders ? formatNum(tokenDetail?.holders) : <LoadingOutlined /> }]
      },
      {
        img: 'fee',
        content: [{ label: 'Transfers', value: transCount ? formatNum(transCount) : <LoadingOutlined /> }]
      },
      ...(!!tokenDetail?.decimals
        ? [
            {
              img: 'decimals',
              content: [{ label: 'Decimals', value: tokenDetail.decimals }]
            }
          ]
        : [])
    ],
    [tokenDetail?.decimals, tokenDetail?.holders, tokenDetail?.totalSupply, transCount]
  )

  return (
    <Container>
      <PageTitle
        title={
          <div className="flex items-center">
            {!!tokenDetail?.logo_path && (
              <div className="mr-8px">
                <Image width={28} height={28} src={tokenDetail?.logo_path} alt="" />
              </div>
            )}
            <div>Token </div>
            <div className="text-[#999] text-16px font-400 ml-10px pb-1px mb-[-4px]">{tokenDetail?.name || tokenDetail?.contractAddress}</div>
          </div>
        }
        showBack
      />
      <Card className="mb-24" title="Overview">
        <div className="w-fit flex items-center px-18px py-4px bg-[#f7f7f7] rounded-4 mb-24">
          <div>
            <span className="text-[#999] font-500 mr-10px">Contract</span>
            <Link type={LinkTypeEnum.ADDRESS} value={token} />
          </div>
        </div>
        <OverviewCards data={overviewContent} />
      </Card>
      <TabCard
        tabList={[
          {
            label: 'Transfers',
            children: <TokenDetailTxsTable tokenAddress={token} type={tokenDetail?.contractType} setCount={setTransCount} />
          },
          {
            label: 'Holders',
            children: <TokenDetailHoldersTable tokenAddress={token} type={tokenDetail?.contractType} />
          },
          {
            label: <ContractTabTitle contractDetail={contractDetail as ContractDetailType} />,
            children: <ContractTab contractDetail={contractDetail as ContractDetailType} />
          }
        ]}
      />
    </Container>
  )
}

export default BlockchainTokenDetail
