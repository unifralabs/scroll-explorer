import { useCallback, useEffect } from 'react'
import { generatePath } from 'react-router-dom'

import { isAddress } from '@ethersproject/address'
import { Button, Form, Input, Select, Space } from 'antd'
import Image from 'next/image'
import { useRouter } from 'next/router'

import Loading from '@/components/common/loading'
import VerifyContractPage from '@/components/contract/verify-contract-page'
import ROUTES from '@/constants/routes'
import Container from '@/layout/container'
import { getImgSrc, stringifyQueryUrl } from '@/utils'
import { trpc } from '@/utils/trpc'

export enum ContractCompilerTypeEnum {
  FILE = 'Solidity (Single file / Multi-Part files)',
  JSON = 'Solidity (Standard-Json-Input)'
}

const ContractVerify: React.FC = () => {
  const [form] = Form.useForm()
  const router = useRouter()
  const search: any = router?.query
  const { contractAddress } = search

  useEffect(() => {
    !!contractAddress && form.setFieldsValue({ contractAddress })
  }, [contractAddress, form])

  const { isLoading, data: compilerVersions } = trpc.contract.getCompilerVersions.useQuery()

  const onFinish = useCallback(
    (values: { contractAddress: string; contractCompilerVersion: string; contractCompilerType: ContractCompilerTypeEnum }) =>
      router.push(
        stringifyQueryUrl(
          generatePath(ROUTES.CONTRACT.PUBLISH, {
            contractAddress: values?.contractAddress
          }),
          {
            contractCompilerVersion: values?.contractCompilerVersion,
            contractCompilerType: values?.contractCompilerType
          }
        )
      ),
    [router]
  )

  if (isLoading)
    return (
      <Container>
        <Loading />
      </Container>
    )

  return (
    <Container>
      <VerifyContractPage
        footer={
          <Space>
            <Button className="w-90px" type="primary" onClick={() => form.submit()}>
              Continue
            </Button>
            <Button
              className="w-90px"
              onClick={() =>
                form.setFieldsValue({
                  contractAddress: undefined,
                  contractCompilerVersion: undefined,
                  contractCompilerType: undefined
                })
              }>
              Reset
            </Button>
          </Space>
        }>
        <>
          <div className="text-12 text-[#999] mb-32px">
            <p className="mb-12">
              Source code verification provides <b>transparency</b> for users interacting with smart contracts. By uploading the source code, Unifrascan will
              match
              {`the compiled code with that on the blockchain. Just like contracts, a "smart contract" should provide end users with more information on what they
            are "digitally signing" for and give users an opportunity to audit the code to independently verify that it actually does what it is supposed to do.`}
            </p>
            <p>
              {`Please be informed that advanced settings (e.g. bytecodeHash: "none" or viaIR: "true") can be accessed via Solidity (Standard-Json-Input)
              verification method. More information can be found under Solidity's "Compiler Input and Output JSON Description" documentation section.`}
            </p>
          </div>
          <div className="flexCenter">
            <Form className="w-700px" layout="vertical" form={form} initialValues={{ contractAddress }} onFinish={onFinish} autoComplete="off">
              <Form.Item
                label="Please enter the Contract Address you would like to verify"
                name="contractAddress"
                rules={[
                  { required: true, message: 'Please enter the Contract Address' },
                  {
                    validator: (rule, value, callback) => {
                      if (!!value && !isAddress(value)) {
                        callback('Please enter the correct Contract Address')
                      }

                      callback()
                    }
                  }
                ]}>
                <Input placeholder="0x" />
              </Form.Item>
              <Form.Item label="Please select Compiler Type" name="contractCompilerType" rules={[{ required: true, message: 'Please select Compiler Type' }]}>
                <Select placeholder="Please select Compiler Type">
                  {Object.keys(ContractCompilerTypeEnum)?.map(type => (
                    <Select.Option key={type}>{ContractCompilerTypeEnum[type]}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Please select Compiler Version"
                name="contractCompilerVersion"
                rules={[{ required: true, message: 'Please select Compiler Version' }]}>
                <Select placeholder="Please select Compiler Version">
                  {compilerVersions?.map((version: string) => (
                    <Select.Option key={version}>{version}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
            <Image className="ml-[8%]" width={350} src={getImgSrc('contract/verify')} alt="" />
          </div>
        </>
      </VerifyContractPage>
    </Container>
  )
}

export default ContractVerify
