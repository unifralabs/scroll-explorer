import { useMemo } from 'react'

import Card from 'antd/lib/card/Card'
import { useRouter } from 'next/router'

import InternalTxsTable from '@/components/blockchain/internal-txs-table'
import PendingTxsTable from '@/components/blockchain/pending-txs-table'
import TxsTable from '@/components/blockchain/txs-table'
import Link from '@/components/common/link'
import PageTitle from '@/components/common/page-title'
import TabCard from '@/components/common/tab-card'
import Container from '@/layout/container'
import { LinkTypeEnum } from '@/types'

const BlockchainTxs: React.FC = () => {
  const router = useRouter()
  const search: any = router?.query

  const block = useMemo(() => search?.block, [search])
  const internalBlock = useMemo(() => search?.internalBlock, [search])

  return (
    <Container>
      <PageTitle
        title={
          <div className="flex items-end">
            <div>Transactions</div>
            {undefined !== block && (
              <div className="text-secondText text-14px ml-18px mb-3px">
                For Block <Link type={LinkTypeEnum.BLOCK} value={block} />
              </div>
            )}
          </div>
        }
      />
      {undefined === block && undefined === internalBlock && (
        <TabCard
          tabList={[
            { label: 'All', children: <TxsTable /> },
            { label: 'Pending', children: <PendingTxsTable /> },
            { label: 'Contract Internal', children: <InternalTxsTable /> }
          ]}
        />
      )}

      {/* txs for block */}
      {undefined !== block && (
        <Card>
          <TxsTable />
        </Card>
      )}

      {/* contract internal txs for block */}
      {undefined !== internalBlock && (
        <Card>
          <InternalTxsTable />
        </Card>
      )}
    </Container>
  )
}

export default BlockchainTxs
