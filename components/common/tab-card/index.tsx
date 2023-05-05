import { ReactNode, useEffect, useState } from 'react'

import { Card, Tabs } from 'antd'
import { useRouter } from 'next/router'

export type TabCardListProps = { label: string | ReactNode; children: ReactNode }[]

type TabCardPropsType = {
  className?: string
  defaultActiveKey?: string
  tabList: TabCardListProps
}

const TabCard: React.FC<TabCardPropsType> = ({ className = '', defaultActiveKey = '0', tabList }) => {
  const router = useRouter()
  const search: any = router?.query

  const [activeKey, setActiveKey] = useState(defaultActiveKey)

  useEffect(() => {
    setActiveKey(defaultActiveKey)
  }, [defaultActiveKey, search])

  return (
    <Card className={className} bodyStyle={{ paddingTop: '10px' }}>
      <Tabs
        activeKey={activeKey}
        items={tabList?.map(({ label, children }, index) => ({ label, key: index + '', children }))}
        onChange={key => setActiveKey(key)}
      />
    </Card>
  )
}

export default TabCard
