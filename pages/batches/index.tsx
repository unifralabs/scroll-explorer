import BatchesTableCard from '@/components/blockchain/batches-table-card'
import PageTitle from '@/components/common/page-title'
import Container from '@/layout/container'

const BlockchainBatches: React.FC = () => {
  return (
    <Container>
      <PageTitle title="Batches" />
      <BatchesTableCard />
    </Container>
  )
}

export default BlockchainBatches
