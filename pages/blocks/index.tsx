import BlocksTableCard from '@/components/blockchain/blocks-table-card'
import PageTitle from '@/components/common/page-title'
import Container from '@/layout/container'

const BlockchainBlocks: React.FC = () => {
  return (
    <Container>
      <PageTitle title="Blocks" />
      <BlocksTableCard />
    </Container>
  )
}

export default BlockchainBlocks
