import { useMemo, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import Scrollbars from 'react-custom-scrollbars'

import { CopyOutlined, DownOutlined, LoadingOutlined, QrcodeOutlined, RightOutlined } from '@ant-design/icons'
import { getAddress, isAddress } from '@ethersproject/address'
import { Card, Dropdown, Input, Modal, Tooltip } from 'antd'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { AddressInternalTxsTable } from '@/components/address/internal-txs-table'
import AddressTokenTxsTable from '@/components/address/token-txs-table'
import { AddressTxsTable } from '@/components/address/txs-table'
import AddressAvatar from '@/components/common/address-avatar'
import AddressQrcode from '@/components/common/address-qrcode'
import { TokenLink, getLinkRoute } from '@/components/common/link'
import PageTitle from '@/components/common/page-title'
import TabCard, { TabCardListProps } from '@/components/common/tab-card'
import ContractTab, { ContractTabTitle } from '@/components/contract/contract-tab'
import { TIPS } from '@/constants'
import Container from '@/layout/container'
import { AddressTokenBalanceType, ContractTypeEnum, LinkTypeEnum, TokenTypeEnum } from '@/types'
import { formatNum, getImgSrc, transDisplayNum } from '@/utils'
import message from '@/utils/message'
import { trpc } from '@/utils/trpc'

import style from './index.module.scss'

const BlockchainAddressDetail: React.FC = () => {
  const router = useRouter()
  const search: any = router?.query
  const address = isAddress(search?.address) ? getAddress(search?.address) : search?.address

  const [showAddressQrcodeModal, setShowAddressQrcodeModal] = useState(false)
  const { isFetching: addressTypeLoading, data: addressType } = trpc.util.search.useQuery(address, { enabled: !!address })
  const { isFetching: addressSummaryLoading, data: addressSummary } = trpc.address.getAddressSummary.useQuery(address, { enabled: !!address })

  const { isFetching: erc20TokenBalanceLoading, data: erc20TokenBalance } = trpc.address.getAddressTokenBalance.useQuery(
    {
      address: address,
      tokenType: TokenTypeEnum.ERC20
    },
    { enabled: !!address }
  )
  const { isFetching: erc721TokenBalanceLoading, data: erc721TokenBalance } = trpc.address.getAddressTokenBalance.useQuery(
    {
      address: address,
      tokenType: TokenTypeEnum.ERC721
    },
    { enabled: !!address }
  )
  const { isFetching: erc1155TokenBalanceLoading, data: erc1155TokenBalance } = trpc.address.getAddressTokenBalance.useQuery(
    {
      address: address,
      tokenType: TokenTypeEnum.ERC1155
    },
    { enabled: !!address }
  )

  const isContract = useMemo(() => (undefined === addressType ? undefined : LinkTypeEnum.CONTRACT === addressType?.result), [addressType])

  const { isFetching: isFetchingContract, data: contractDetail } = trpc.contract.getContractDetail.useQuery(address, { enabled: !!isContract })

  const isToken = useMemo(
    () =>
      undefined !== contractDetail?.contractType &&
      [ContractTypeEnum.ERC20, ContractTypeEnum.ERC721, ContractTypeEnum.ERC1155].includes(contractDetail?.contractType),
    [contractDetail?.contractType]
  )

  const tokenContent = useMemo(() => {
    const title = {
      [TokenTypeEnum.ERC20]: 'ERC-20',
      [TokenTypeEnum.ERC721]: 'ERC-721',
      [TokenTypeEnum.ERC1155]: 'ERC-1155'
    }

    const renderTokenList = (tokenList: AddressTokenBalanceType[], tokenType: TokenTypeEnum) => (
      <div className="pb-12">
        <div className="rounded-4 bg-[#eee] px-12 py-6px flex items-center mb-6px">
          <RightOutlined className="text-10px mr-8px" />
          <span className="font-bold mr-4px">{title[tokenType]}</span>
          <span>({tokenList?.length})</span>
        </div>
        {tokenList?.map(({ name, symbol, contractAddress, value, decimals, logo_path, tokenId = 0 }) => (
          <div key={contractAddress} className={style.tokenBalanceWrap} onClick={() => router.push(getLinkRoute(LinkTypeEnum.TOKEN, contractAddress))}>
            <div className="w-full ellipsis">
              <TokenLink name={name} symbol={symbol} tokenAddress={contractAddress} img={logo_path} imgSize={14} imgLineHeight={15} ellipsis />
              <div className="text-secondText mt-2px ellipsis">
                {transDisplayNum({ num: value, decimals, suffix: symbol })}
                {tokenType === TokenTypeEnum.ERC1155 && ` (${new BigNumber(tokenId, 16)?.toString(10)})`}
              </div>
            </div>
          </div>
        ))}
      </div>
    )

    return (
      <div className="h-300px ">
        <Scrollbars universal={true} autoHide>
          <div className="px-12 pt-12 bg-white rounded-4 border-1px border-solid border-[#f0f0f0]">
            {!!erc20TokenBalance?.length && renderTokenList(erc20TokenBalance, TokenTypeEnum.ERC20)}

            {!!erc721TokenBalance?.length && renderTokenList(erc721TokenBalance, TokenTypeEnum.ERC721)}

            {!!erc1155TokenBalance?.length && renderTokenList(erc1155TokenBalance, TokenTypeEnum.ERC1155)}
          </div>
        </Scrollbars>
      </div>
    )
  }, [erc20TokenBalance, erc721TokenBalance, erc1155TokenBalance, router])

  const tokenTabs = useMemo(() => {
    const data: TabCardListProps = []

    data.push({
      label: 'Erc20 Token Txns',
      children: <AddressTokenTxsTable address={address} type={TokenTypeEnum.ERC20} />
    })

    data.push({
      label: 'Erc721 Token Txns',
      children: <AddressTokenTxsTable address={address} type={TokenTypeEnum.ERC721} />
    })

    data.push({
      label: 'Erc1155 Token Txns',
      children: <AddressTokenTxsTable address={address} type={TokenTypeEnum.ERC1155} />
    })

    if (!!isContract && !!contractDetail) {
      data.push({
        label: <ContractTabTitle contractDetail={contractDetail} />,
        children: <ContractTab contractDetail={contractDetail} />
      })
    }

    return data
  }, [isContract, contractDetail, address])

  return (
    <Container>
      <PageTitle
        title={
          <div className="flex items-center">
            <AddressAvatar address={address} />
            <span className="mx-10px">{isContract ? 'Contract' : 'Address'}</span>
            <span className="text-secondText text-16px mt-2px">{address}</span>
            <CopyToClipboard text={address ?? ''} onCopy={() => message.success(TIPS.copied)}>
              <div className={classNames(style.titleIcon, 'ml-10px mr-4px')}>
                <CopyOutlined />
              </div>
            </CopyToClipboard>
            <div className={style.titleIcon} onClick={() => setShowAddressQrcodeModal(true)}>
              <QrcodeOutlined />
            </div>
          </div>
        }
        showBack
      />
      <Card className="mb-24" title={`${!!isContract ? 'Contract' : 'Address'} Overview`}>
        <div className="grid grid-cols-3 space-y-3 items-center">
          <div>
            <div className="flex items-center mb-6px">
              <div className="font-400 text-[#666]">Balance</div>
              <Tooltip title="Address balance in ETH doesn't include ERC20, ERC721, ERC1155 tokens.">
                <Image className="cursor-pointer ml-6px" width={14} src={getImgSrc('qa')} alt="" />
              </Tooltip>
            </div>
            <div>
              {addressSummary?.balance ? (
                transDisplayNum({
                  num: addressSummary?.balance,
                  fixedNum: 18
                })
              ) : (
                <LoadingOutlined />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center mb-6px">
              <div className="font-400 text-[#666]">Token</div>
              <Tooltip title="All tokens in the account and total value.">
                <Image className="cursor-pointer ml-6px" width={14} src={getImgSrc('qa')} alt="" />
              </Tooltip>
            </div>
            <div className="w-[80%] max-w-400px">
              {erc20TokenBalance || erc721TokenBalance || erc1155TokenBalance ? (
                !!!erc20TokenBalance?.length && !!!erc721TokenBalance?.length && !!!erc1155TokenBalance?.length ? (
                  <span>$0.00</span>
                ) : (
                  <Dropdown dropdownRender={() => tokenContent} trigger={['click']}>
                    <Input className={style.tokenBalanceInput} suffix={<DownOutlined className="text-12" />} value="$0" readOnly />
                  </Dropdown>
                )
              ) : (
                <LoadingOutlined />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center mb-6px">
              <div className="font-400 text-[#666]">Gas Used</div>
              <Tooltip title="Gas used by the address.">
                <Image className="cursor-pointer ml-6px" width={14} src={getImgSrc('qa')} alt="" />
              </Tooltip>
            </div>
            <div>{addressSummary ? addressSummary?.gas_used || 0 : <LoadingOutlined />}</div>
          </div>
          <div>
            <div className="flex items-center mb-6px">
              <div className="font-400 text-[#666]">Transactions</div>
              <Tooltip title="Number of transactions related to this address.">
                <Image className="cursor-pointer ml-6px" width={14} src={getImgSrc('qa')} alt="" />
              </Tooltip>
            </div>
            <div>{addressSummary ? formatNum(addressSummary?.transaction_count) || 0 : <LoadingOutlined />}</div>
          </div>
          <div>
            <div className="flex items-center mb-6px">
              <div className="font-400 text-[#666]">Transfers</div>
              <Tooltip title="Number of transfers to/from this address.">
                <Image className="cursor-pointer ml-6px" width={14} src={getImgSrc('qa')} alt="" />
              </Tooltip>
            </div>
            <div>{addressSummary ? formatNum(addressSummary?.token_transfer_count) || 0 : <LoadingOutlined />}</div>
          </div>

          <div>
            <div className="flex items-center mb-6px">
              <div className="font-400 text-[#666]">Last Balance Update</div>
              <Tooltip title="Block number in which the address was updated.">
                <Image className="cursor-pointer ml-6px" width={14} src={getImgSrc('qa')} alt="" />
              </Tooltip>
            </div>
            <div>{addressSummary ? formatNum(addressSummary?.last_balance_update) || '-' : <LoadingOutlined />}</div>
          </div>
          {isToken && (
            <div>
              <div className="flex items-center mb-6px">
                <div className="font-400 text-[#666]">Token Tracker</div>
                <Tooltip title="Track token details and movements.">
                  <Image className="cursor-pointer ml-6px" width={14} src={getImgSrc('qa')} alt="" />
                </Tooltip>
              </div>
              <TokenLink name={contractDetail?.name} symbol={contractDetail?.symbol} tokenAddress={address} img={contractDetail?.logo_path} />
            </div>
          )}
        </div>
      </Card>
      <TabCard
        tabList={[
          { label: 'Transactions', children: <AddressTxsTable address={address} isContract={isContract} /> },
          ...[{ label: 'Internal Txns', children: <AddressInternalTxsTable address={address} isContract={isContract} /> }],
          ...tokenTabs
        ]}
      />
      <Modal open={showAddressQrcodeModal} width={500} footer={null} onCancel={() => setShowAddressQrcodeModal(false)} centered>
        <div className="flexCenter flex-col">
          <div className="text-16px mt-24 mb-12 font-bold">{address}</div>
          <AddressQrcode address={address} size={300} />
        </div>
      </Modal>
    </Container>
  )
}

export default BlockchainAddressDetail
