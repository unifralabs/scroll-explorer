import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Select } from 'antd'

import { formatNum } from '@/utils'

interface PaginationProps {
  currentPage: number
  totalResults: number
  pageSize: number
  onCursorChange: (direction: 'first' | 'prev' | 'next' | 'last') => void
  onPageSizeChange: (pageSize: number) => void
}

export default function Pagination({ currentPage, totalResults, pageSize, onCursorChange, onPageSizeChange }: PaginationProps) {
  const totalPages = Math.ceil(totalResults / pageSize)
  const cur = currentPage < 0 ? totalPages + currentPage + 1 : currentPage

  return (
    <div className="flex items-center justify-between pb-3">
      <div className="text-sm text-gray-400">A total of {formatNum(totalResults)} transactions found</div>
      <div className="flex items-center gap-2">
        <Button type="default" size={'small'} disabled={cur === 1} onClick={() => onCursorChange('first')}>
          First
        </Button>
        <Button type="text" icon={<LeftOutlined />} disabled={cur === 1} onClick={() => onCursorChange('prev')} />
        <div>
          <span className="text-main font-bold"> {cur} </span>
          <span className="mx-1">/</span>
          {totalPages}
        </div>

        <Button type="text" icon={<RightOutlined />} disabled={cur === totalPages} onClick={() => onCursorChange('next')} />
        <Button type="default" size={'small'} disabled={cur === totalPages} onClick={() => onCursorChange('last')}>
          Last
        </Button>

        <div>
          <Select
            defaultValue={pageSize}
            size={'small'}
            onChange={value => onPageSizeChange(value)}
            options={[
              { value: 10, label: '10 / page' },
              { value: 20, label: '20 / page' },
              { value: 50, label: '50 / page' },
              { value: 100, label: '100 / page' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
