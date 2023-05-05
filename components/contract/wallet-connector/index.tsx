import { WalletOutlined } from '@ant-design/icons'
import { Badge, Button } from 'antd'
import { useAccount, useConnect, useEnsName } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

import { shortAddress } from '@/utils'

export default function WalletConnector() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect, isLoading } = useConnect({
    connector: new InjectedConnector()
  })

  return (
    <div className="mt-5">
      {isConnected ? (
        <Badge status="success" text={'Connected - ' + (ensName || shortAddress(address))} />
      ) : (
        <Button icon={<WalletOutlined />} onClick={() => connect()} loading={isLoading}>
          Connect Wallet
        </Button>
      )}
    </div>
  )
}
