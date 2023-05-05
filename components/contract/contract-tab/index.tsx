import { useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

import { Button, Col, Row } from 'antd'
import classNames from 'classnames'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useContract } from 'wagmi'

import { TextAreaRow } from '@/components/common/table-col-components'
import { TIPS } from '@/constants'
import ROUTES from '@/constants/routes'
import { ContractDetailType, ContractVerifyStatusEnum } from '@/types'
import { getImgSrc, stringifyQueryUrl } from '@/utils'
import message from '@/utils/message'

import WalletConnector from '../wallet-connector'
import ContractFunctionsPanel from './contract-functions-panel'

type ContractTabPropsType = { contractDetail: ContractDetailType | undefined }

const ICON_CLASS = 'cursor-pointer transition-all duration-300 hover:opacity-70'

export const ContractTabTitle: React.FC<ContractTabPropsType> = ({ contractDetail }) =>
  ContractVerifyStatusEnum.VERIFIED === contractDetail?.status ? (
    <div className="flex items-center">
      <span>Contract</span>
      <Image className="ml-8px" width={16} src={getImgSrc('contract/right')} alt="" />
    </div>
  ) : (
    <>Contract</>
  )

const VerifiedContractTab: React.FC<ContractTabPropsType> = ({ contractDetail }) => {
  const AceEditor = dynamic(import('react-ace'), { ssr: false })
  const [subTab, setSubTab] = useState('code')
  const abi = contractDetail?.contractABI ? JSON.parse(contractDetail?.contractABI) : []
  const contract = useContract({ address: contractDetail?.contractAddress, abi: abi })

  return (
    <div>
      <div className="flex items-center space-x-3">
        <Button type={subTab === 'code' ? 'primary' : 'default'} onClick={() => setSubTab('code')}>
          Code
        </Button>
        <Button type={subTab === 'read' ? 'primary' : 'default'} onClick={() => setSubTab('read')}>
          Read Contract
        </Button>
        <Button type={subTab === 'write' ? 'primary' : 'default'} onClick={() => setSubTab('write')}>
          Write Contract
        </Button>
      </div>
      <WalletConnector />
      {subTab === 'code' && (
        <div>
          <div className="flex items-center my-12">
            <Image className="mr-8px" width={16} src={getImgSrc('contract/right')} alt="" />
            <span className="font-500">Contract Source Code Verified</span>
            <span className="font-400 ml-4px text-[#999]">(Exact Match)</span>
          </div>
          <Row className="mb-24 bg-[#fafafa] px-34px py-14px rounded-4" gutter={24}>
            {[
              { label: 'Contract Name', value: contractDetail?.contractName },
              { label: 'Contract Version', value: contractDetail?.compiler },
              { label: 'Optimization Enabled', value: contractDetail?.optimizationEnabled },
              { label: 'Other Settings', value: 'default evmVersion' }
            ]?.map(({ label, value }) => (
              <Col key={label} span={6}>
                <div className="font-400">
                  <div className="text-[#666] mb-6px">{label}:</div>
                  <div>{value}</div>
                </div>
              </Col>
            ))}
          </Row>
          <div className="mb-12">
            <span className="font-500">Contract Source Code</span>
            <span className="font-400 ml-4px text-[#999]">(Solidity)</span>
          </div>
          {contractDetail?.sources?.map(({ name, content }) => (
            <div key={name} className="mb-12">
              <div className="flex justify-between items-center text-12 text-[#666] mb-12">
                <span>{name}</span>
                <div className="flexCenter">
                  <CopyToClipboard text={content} onCopy={() => message.success(TIPS.copied)}>
                    <Image className={classNames(ICON_CLASS, 'mr-16px')} width={28} src={getImgSrc('contract/copy')} alt="" />
                  </CopyToClipboard>

                  <CopyToClipboard text={location?.href} onCopy={() => message.success(TIPS.copied)}>
                    <Image className={ICON_CLASS} width={28} src={getImgSrc('contract/link')} alt="" />
                  </CopyToClipboard>

                  {/* <Image className={ICON_CLASS} width={28} src={getImgSrc('contract/full')} alt="" /> */}
                </div>
              </div>
              {!!content && (
                <div>
                  <AceEditor
                    className="border-1px border-border border-solid"
                    mode="text"
                    style={{ width: '100%' }}
                    value={content}
                    showPrintMargin={false}
                    readOnly
                  />
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-between items-center mt-34px mb-12">
            <div className="font-500">Contract ABI</div>
            <CopyToClipboard text={contractDetail?.contractABI ?? ''} onCopy={() => message.success(TIPS.copied)}>
              <Image className={classNames(ICON_CLASS, 'mr-16px')} width={28} src={getImgSrc('contract/copy')} alt="" />
            </CopyToClipboard>
          </div>
          <TextAreaRow className="w-full mb-12" value={contractDetail?.contractABI} />
        </div>
      )}
      {subTab === 'read' && <ContractFunctionsPanel contract={contract} abi={abi} type="read" />}
      {subTab === 'write' && <ContractFunctionsPanel contract={contract} abi={abi} type="write" />}
    </div>
  )
}

const UnverifiedContractTab: React.FC<ContractTabPropsType> = ({ contractDetail }) => {
  const router = useRouter()

  return (
    <>
      <div className="flex justify-between items-center my-12">
        <div className="flexCenter">
          <Image className="mr-6px" width={16} src={getImgSrc('contract/info')} alt="" />
          <span> Are you the contract creator? Verify and Publish your contract source code today!</span>
        </div>
        <Button type="primary" onClick={() => router.push(stringifyQueryUrl(ROUTES.CONTRACT.VERIFY, { contractAddress: contractDetail?.contractAddress }))}>
          Verify Contract
        </Button>
      </div>
      <TextAreaRow className="w-full mb-12" value={contractDetail?.byteCode} />
    </>
  )
}

const ContractTab: React.FC<ContractTabPropsType> = ({ contractDetail }) =>
  ContractVerifyStatusEnum.VERIFIED === contractDetail?.status ? (
    <VerifiedContractTab contractDetail={contractDetail} />
  ) : (
    <UnverifiedContractTab contractDetail={contractDetail} />
  )

export default ContractTab
