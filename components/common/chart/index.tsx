import { useCallback, useMemo } from 'react'

import dayjs from 'dayjs'
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatNumWithSymbol } from '@/utils'

type CardPropsType = {
  data: any[]
  xDataKey: string
  yDataKey: string
  xTickStyle?: any
  yTickStyle?: any
  xTickFormatter?: (value: any, index: number) => string
  yTickFormatter?: (value: any, index: number) => string
  tooltipTitle?: string
  tooltipValueFormatter?: (value: string) => any
  strokeColor?: string
  showGrid?: boolean
  gridXColor?: string
  gridDashed?: boolean
  xAngle?: number
  xPanding?: { left?: number; right?: number }
  yWidth?: number
  xUnit?: string
  yUnit?: string
  yTickCount?: number
  yDomain?: any[]
  xInterval?: 0 | 1 | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd'
  type?: 'area' | 'line'
  dot?: any
}

const Chart: React.FC<CardPropsType> = ({
  data,
  xDataKey,
  yDataKey,
  xTickStyle = { fontWeight: 300, color: '#54617A', opacity: 0.5 },
  yTickStyle = { fontWeight: 300, color: '#54617A', opacity: 0.5 },
  xTickFormatter = value => (value && 'auto' !== value ? dayjs(value).format(`MMM 'DD`) : ''),
  yTickFormatter = value => formatNumWithSymbol(value, 0),
  tooltipTitle,
  tooltipValueFormatter,
  strokeColor = '#FDC2A0',
  showGrid = true,
  gridXColor = '#edeef0',
  gridDashed = false,
  xAngle = 0,
  xPanding = { left: 20, right: 20 },
  yWidth = 60,
  xUnit = '',
  yUnit = '',
  yTickCount = 5,
  yDomain,
  xInterval = 'preserveEnd',
  type = 'line',
  dot = { stroke: '#FF4D2C', strokeWidth: 1 }
}) => {
  const renderCustomTooltip = useCallback(
    (external: any) => {
      const { active, payload, label } = external

      if (active && payload && payload.length) {
        return (
          <div className="text-12 font-500 border-[0.5px] border-solid border-border rounded-4 p-10px mb-6px bg-[#fffffffa]">
            <div className="mb-6px">{dayjs(label).format('dddd,MMMM DD,YYYY')}</div>
            <div className="font-400 text-[#666]">
              <div>{tooltipTitle}</div>
              <div>{payload?.[0]?.payload?.[yDataKey]}</div>
            </div>
          </div>
        )
      }

      return null
    },
    [tooltipTitle, yDataKey]
  )

  const lineAreaProps = useMemo(
    () => ({
      dataKey: yDataKey,
      stroke: strokeColor,
      strokeWidth: 1,
      dot,
      r: 1,
      activeDot: {
        stroke: '#F26412',
        strokeWidth: 1,
        r: 2
      },
      isAnimationActive: false
    }),
    [dot, strokeColor, yDataKey]
  )

  const chartContent = useMemo(
    () => (
      <>
        <defs>
          <linearGradient id="reqColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="33.25%" stopColor="#FDC2A0" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#FDC2A0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          unit={xUnit}
          padding={xPanding}
          fontSize={11}
          tickMargin={10}
          dataKey={xDataKey}
          axisLine={false}
          tickLine={false}
          interval={xInterval}
          angle={xAngle}
          tick={xTickStyle}
          tickFormatter={xTickFormatter}
        />
        <YAxis
          width={yWidth}
          domain={yDomain}
          unit={yUnit}
          fontSize={11}
          tickMargin={10}
          axisLine={false}
          tickLine={false}
          tick={yTickStyle}
          tickCount={yTickCount}
          tickFormatter={yTickFormatter}
        />
        {showGrid && <CartesianGrid color={gridXColor} height={0.7} vertical={false} strokeDasharray={gridDashed ? '5' : 0} />}
        <Tooltip content={renderCustomTooltip} />
        {'line' === type && <Line type="monotone" {...lineAreaProps} />}
        {'area' === type && <Area type="monotone" {...lineAreaProps} fillOpacity={1} fill="url(#reqColor)" />}
      </>
    ),
    [
      gridDashed,
      gridXColor,
      lineAreaProps,
      renderCustomTooltip,
      showGrid,
      type,
      xAngle,
      xDataKey,
      xInterval,
      xPanding,
      xTickFormatter,
      xTickStyle,
      xUnit,
      yDomain,
      yTickCount,
      yTickFormatter,
      yTickStyle,
      yUnit,
      yWidth
    ]
  )

  const chartWrap = useMemo(() => {
    switch (type) {
      case 'area':
        return <AreaChart data={data}>{chartContent}</AreaChart>
      case 'line':
        return <LineChart data={data}>{chartContent}</LineChart>
      default:
        return <></>
    }
  }, [type, data, chartContent])

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartWrap}
    </ResponsiveContainer>
  )
}

export default Chart
