import { useRouter } from 'next/router'

import BlocksTableCard from '@/components/blockchain/blocks-table-card'
import PageTitle from '@/components/common/page-title'
import Container from '@/layout/container'
import { trpc } from '@/utils/trpc'

const BlockchainBlocks: React.FC = () => {
  const router = useRouter()
  const { batch }: any = router?.query

  const { isLoading, data } = trpc.batch.getBatchDetail.useQuery(Number(batch), { enabled: !!batch })

  return (
    <Container>
      <PageTitle title={`Batch #${batch}`} />
      <BlocksTableCard block_numbers={data?.blockNumbers.map((blockNumber: any) => Number(blockNumber))} />
    </Container>
  )
}

export default BlockchainBlocks
