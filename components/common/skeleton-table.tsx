// skeleton-table.tsx
import { Skeleton, SkeletonProps, Table, TablePaginationConfig } from 'antd'
import { ColumnsType } from 'antd/lib/table'

export type SkeletonTableColumnsType = {}

type SkeletonTableProps = SkeletonProps & {
  columns: ColumnsType<SkeletonTableColumnsType>
  rowCount?: number
  pagination?: false | TablePaginationConfig
}

export default function SkeletonTable({
  loading = false,
  active = false,
  pagination = false,
  rowCount = 10,
  columns,
  children,
  className
}: SkeletonTableProps): JSX.Element {
  return loading ? (
    <Table
      rowKey="key"
      pagination={pagination || false}
      dataSource={[...Array(rowCount)].map((_, index) => ({
        key: `key${index}`
      }))}
      columns={columns.map(column => {
        return {
          ...column,
          render: function renderPlaceholder() {
            return <Skeleton title active={active} paragraph={false} className={className} />
          }
        }
      })}
    />
  ) : (
    <>{children}</>
  )
}
