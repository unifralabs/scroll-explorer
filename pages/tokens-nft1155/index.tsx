import TokenPage from '@/components/tokens/token-page'
import Container from '@/layout/container'
import { TokenTypeEnum } from '@/types'

const TopTokens: React.FC = () => {
  return (
    <Container>
      <TokenPage type={TokenTypeEnum.ERC1155} />
    </Container>
  )
}

export default TopTokens
