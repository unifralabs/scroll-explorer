import { useEffect, useMemo, useState } from 'react'

import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
import { Table } from 'antd'
import classNames from 'classnames'

import { TokenLink } from '@/components/common/link'
import SkeletonTable, { SkeletonTableColumnsType } from '@/components/common/skeleton-table'
import { PAGE_SIZE } from '@/constants'
import { TokenType, TokenTypeEnum } from '@/types'
import { convertNum, formatNum, getPaginationConfig } from '@/utils'
import { trpc } from '@/utils/trpc'

const TokenTable: React.FC<{ type: TokenTypeEnum }> = ({ type }) => {
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  useEffect(() => {
    setCurrent(1)
    setPageSize(PAGE_SIZE)
  }, [type])

  const { isLoading, data } = trpc.token.getTokenList.useQuery({ offset: (current - 1) * pageSize, limit: pageSize, tokenType: type }, { enabled: !!type })

  const columns = useMemo(() => {
    const cols = [
      { title: '#', width: 60, render: (_data: unknown, _: TokenType, index: number) => index + (current - 1) * pageSize + 1 },
      {
        title: 'Token',
        render: ({ name, symbol, contractAddress, logo_path, description }: TokenType) => (
          <TokenLink name={name} symbol={symbol} imgSize={22} tokenAddress={contractAddress} img={logo_path} desc={description} />
        )
      }
    ]
    const otherCols =
      TokenTypeEnum.ERC20 === type
        ? [
            { title: 'Price', dataIndex: 'Price', width: 150, render: (num: number) => formatNum(num || '0.0', '$') },
            {
              title: 'Change (%)',
              dataIndex: 'Change',
              width: 150,
              render: (num: number) => (
                <div className={classNames(0 === Number(num ?? 0) ? '--' : (num ?? 0) > 0 ? 'text-green' : 'text-red', 'flex items-center')}>
                  {0 !== Number(num ?? 0) &&
                    ((num ?? 0) > 0 ? <CaretUpOutlined className="text-12 text-green mr-4px" /> : <CaretDownOutlined className="text-12 text-red mr-4px" />)}
                  <span>{0 === Number(num ?? 0) ? '--' : formatNum(num)}</span>
                </div>
              )
            },
            { title: 'Market Cap', dataIndex: 'OnChainMarketCap', width: 150, render: (num: number) => formatNum(num || '0.0', '$') },
            { title: 'Holders', dataIndex: 'holders', width: 150, render: (num: number | bigint) => formatNum(convertNum(num)) }
          ]
        : [
            { title: 'Transfers (24H)', dataIndex: 'trans24h', width: 150, render: (num: number) => formatNum(num) },
            { title: 'Transfers (3D)', dataIndex: 'trans3d', width: 150, render: (num: number) => formatNum(num) }
          ]

    return [...cols, ...otherCols]
  }, [type, current, pageSize])

  return (
    <SkeletonTable active loading={isLoading} columns={columns as SkeletonTableColumnsType[]}>
      <Table
        rowKey="contractAddress"
        dataSource={data?.list as any[]}
        columns={columns}
        pagination={getPaginationConfig({ current, pageSize, total: Number(data?.count), totalLabel: 'tokens', setCurrent, setPageSize })}
      />
    </SkeletonTable>
  )
}

export default TokenTable
