import { useState } from 'react'

import { Card, DatePicker } from 'antd'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'

import Chart from '@/components/common/chart'
import Loading from '@/components/common/loading'
import PageTitle from '@/components/common/page-title'
import Container from '@/layout/container'
import { ChartTypeEnum, chartTitle } from '@/pages/charts'
import { StatisticsTimeQueryType, TokenTypeEnum } from '@/types'
import { trpc } from '@/utils/trpc'

const defaultTimeQuery = {
  timeStart: dayjs().subtract(1, 'year').unix(),
  timeEnd: dayjs().unix()
}

const chartConfig: any = {
  [ChartTypeEnum.TX]: {
    chartType: 'line',
    chartTooltipTitle: 'Total Transactions'
  },
  [ChartTypeEnum.ERC2ETXNS]: {
    chartType: 'line',
    chartTooltipTitle: 'Total Token Transfer'
  },
  [ChartTypeEnum.ADDRESS]: {
    chartType: 'area',
    chartTooltipTitle: 'Total Distinct Addresses'
  }
}

const disabledDate = (currentDate: any) => dayjs().isBefore(dayjs(currentDate))

const ChartDetail: React.FC = () => {
  const router = useRouter()
  const search: any = router?.query
  const { chart } = search

  const [timeRange, setTimeRange] = useState<StatisticsTimeQueryType>(defaultTimeQuery)

  const { isFetching: dailyTxCountFetching, data: dailyTxCount } = trpc.stat.getDailyTxCount.useQuery(timeRange, {
    enabled: !!timeRange && chart === ChartTypeEnum.TX
  })

  const { isFetching: dailyTokenTransferCountFetching, data: dailyTokenTransferCount } = trpc.stat.getDailyTokenTransferCount.useQuery(
    {
      ...timeRange,
      tokenType: TokenTypeEnum.ERC20
    },
    { enabled: !!timeRange && chart === ChartTypeEnum.ERC2ETXNS }
  )

  const { isFetching: uniqueAddressesCountFetching, data: uniqueAddressesCount } = trpc.stat.getUniqueAddressesCount.useQuery(timeRange, {
    enabled: !!timeRange && chart === ChartTypeEnum.ADDRESS
  })

  if (dailyTxCountFetching || dailyTokenTransferCountFetching || uniqueAddressesCountFetching) {
    return (
      <Container>
        <PageTitle title={chartTitle?.[chart]?.title} showBack />
        <Loading />
      </Container>
    )
  }

  return (
    <Container>
      <PageTitle title={chartTitle?.[chart]?.title} showBack />
      <Card
        className="h-[calc(100vh-152px)] min-h-500px"
        title={<div className="text-[#999] text-14 leading-22px font-400">{chartTitle?.[chart]?.tip}</div>}
        bodyStyle={{ height: 'calc(100% - 55px)' }}>
        <div className="w-full flex justify-end mb-12">
          <DatePicker.RangePicker
            className="small-date-range-picker"
            size="middle"
            disabledDate={disabledDate}
            allowClear
            onChange={(dates: any) =>
              setTimeRange({
                timeStart: dates?.[0] ? dayjs(dates?.[0]).unix() : defaultTimeQuery.timeStart,
                timeEnd: dates?.[1] ? dayjs(dates?.[1]).unix() : defaultTimeQuery.timeEnd
              })
            }
          />
        </div>
        <div className="w-full h-[calc(100%-42px)]">
          <Chart
            type={chartConfig?.[chart]?.chartType}
            xDataKey="date"
            yDataKey="count"
            data={
              (chart === ChartTypeEnum.TX ? dailyTxCount : chart === ChartTypeEnum.ERC2ETXNS ? dailyTokenTransferCount : uniqueAddressesCount || []) as any[]
            }
            tooltipTitle={chartConfig?.[chart]?.chartTooltipTitle}
          />
        </div>
      </Card>
    </Container>
  )
}

export default ChartDetail
