import { useCallback, useEffect, useMemo, useState } from 'react'
import { generatePath } from 'react-router-dom'

import { Button, Col, Collapse, Form, Input, Modal, Row, Select, Space, Upload } from 'antd'
import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'

import DotText from '@/components/common/dot-text'
import Loading from '@/components/common/loading'
import TabCard from '@/components/common/tab-card'
import VerifyContractPage from '@/components/contract/verify-contract-page'
import ROUTES from '@/constants/routes'
import Container from '@/layout/container'
import { ContractCompilerTypeEnum } from '@/pages/verifyContract'
import { getImgSrc } from '@/utils'
import message from '@/utils/message'
import { trpc } from '@/utils/trpc'

const LICENSE_TYPE_OPTIONS = [
  '1) No License (None)',
  '2) The Unlicense (Unlicense)',
  '3) MIT License (MIT)',
  '4) GNU General Public License v2.0 (GNU GPLv2)',
  '5) GNU General Public License v3.0 (GNU GPLv3)',
  '6) GNU Lesser General Public License v2.1 (GNU LGPLv2.1)',
  '7) GNU Lesser General Public License v3.0 (GNU LGPLv3)',
  '8) BSD 2-clause "Simplified" license (BSD-2-Clause)',
  '9) BSD 3-clause "New" Or "Revised" license (BSD-3-Clause)',
  '10) Mozilla Public License 2.0 (MPL-2.0)',
  '11) Open Software License 3.0 (OSL-3.0)',
  '12) Apache 2.0 (Apache-2.0)',
  '13) GNU Affero General Public License (GNU AGPLv3)',
  '14) Business Source License (BSL 1.1)'
]

const ContractPublish: React.FC = () => {
  const [form] = Form.useForm()
  const router = useRouter()
  const search: any = router?.query
  const { contractAddress, contractCompilerVersion, contractCompilerType } = search

  const { data: evmVersions } = trpc.contract.getCompilerVersions.useQuery()
  const {
    isLoading: isVerifyJsonLoading,
    mutate: verifyJson,
    error: verifyJsonError
  } = trpc.contract.verifyStandardJson.useMutation({
    async onSuccess(data) {
      if (data.status === '1') {
        setGuid(data.result)
      } else {
        message.error(data.message)
      }
    }
  })

  const {
    isLoading: isVerifyMultiPartLoading,
    mutate: verifyMultiPart,
    error: verifyMultiPartError
  } = trpc.contract.verifyMultiPart.useMutation({
    async onSuccess(data) {
      if (data.status === '1') {
        setGuid(data.result)
      } else {
        message.error(data.message)
      }
    }
  })

  useEffect(() => {
    !!contractAddress && form.setFieldValue('contractAddress', contractAddress)
  }, [form, contractAddress])

  useEffect(() => {
    !!contractCompilerVersion && form.setFieldValue('compiler', contractCompilerVersion)
  }, [form, contractCompilerVersion])

  useEffect(() => {
    !!evmVersions && form.setFieldValue('evm', evmVersions?.[0])
  }, [evmVersions, form])

  const isJsonType = useMemo(() => ContractCompilerTypeEnum.JSON === ContractCompilerTypeEnum[contractCompilerType], [contractCompilerType])

  const [fileList, setFileList] = useState<any[]>()
  const [libraries, setLibraries] = useState<[string, string][]>(Array.from({ length: 10 }, () => ['', '']))

  const setLibraryInfo = useCallback(
    (index: number, keyOrValue: 'key' | 'value', info: string) => {
      const newLibraries = [...libraries]
      newLibraries[index][keyOrValue === 'key' ? 0 : 1] = info
      setLibraries(newLibraries)
    },
    [libraries]
  )

  const [publishResult, setPublishResult] = useState<'loading' | 'success' | 'fail'>('loading')
  const [showPublishResultModal, setShowPublishResultModal] = useState(false)
  const [guid, setGuid] = useState<string>('')
  const { data: queryVerifyStatus, error: queryVerifyStatusError } = trpc.contract.checkverifystatus.useQuery(
    {
      module: 'contract',
      action: 'checkverifystatus',
      guid: guid
    },
    {
      enabled: !!guid && publishResult === 'loading',
      refetchInterval: 1000 // 1s
    }
  )

  const onPublish = useCallback(
    async (values: any) => {
      if (!!!fileList?.length) {
        message.error('Please select and upload the solidity files to verify!')
        return
      }

      console.log('values: ', values)

      // upload files
      if (isJsonType) {
        const blob = await fileList[0]?.originFileObj.arrayBuffer()
        const sourceCode = new TextDecoder().decode(blob)
        verifyJson({
          module: 'contract',
          action: 'verifysourcecode',
          contractaddress: contractAddress,
          sourceCode: sourceCode,
          codeformat: 'solidity-standard-json-input',
          contractname: '',
          compilerversion: values.compiler
        })
      } else {
        let files: Record<string, string> = {}
        await Promise.all(
          fileList.map(async (file: any) => {
            const blob = await file.originFileObj.arrayBuffer()
            const sourceCode = new TextDecoder().decode(blob)
            files[file.name] = sourceCode
          })
        )
        const librariesObj = libraries.reduce((acc: any, [key, value]) => {
          if (key && value) {
            acc[key] = value
          }
          return acc
        }, {})
        let verifyInputs: any = {
          contractAddress: contractAddress,
          compilerVersion: contractCompilerVersion,
          sourceFiles: files,
          libraries: librariesObj
        }

        if (values.evm) {
          verifyInputs.evmVersion = values.evm
        }
        if (values.optimizeCount) {
          verifyInputs.optimizationRuns = values.optimizeCount
        }
        verifyMultiPart(verifyInputs)
      }

      !!!showPublishResultModal && setShowPublishResultModal(true)
    },
    [contractAddress, contractCompilerVersion, fileList, isJsonType, verifyJson, verifyMultiPart, libraries, showPublishResultModal]
  )

  useEffect(() => {
    if (queryVerifyStatusError || verifyJsonError || verifyMultiPartError) {
      console.error('verify error message: ', queryVerifyStatusError || verifyJsonError || verifyMultiPartError)
      setPublishResult('fail')
    }
    if (queryVerifyStatus?.result === 'Pending in queue') {
      setPublishResult('loading')
    } else if (queryVerifyStatus?.result === 'Pass - Verified') {
      setPublishResult('success')
    } else if (queryVerifyStatus?.result === 'Fail - Unable to verify') {
      setPublishResult('fail')
    }
  }, [queryVerifyStatus, queryVerifyStatusError, verifyJsonError, verifyMultiPartError])

  return (
    <Container>
      {(isVerifyJsonLoading || isVerifyMultiPartLoading) && <Loading />}
      <VerifyContractPage
        step={2}
        footer={
          <Space>
            <Button className="w-150px" type="primary" onClick={() => form.submit()}>
              Verify and Publish
            </Button>
            <Button className="w-150px" onClick={() => form.resetFields()}>
              Reset
            </Button>
            <Button className="w-150px" onClick={() => router.back()}>
              Return to Main
            </Button>
          </Space>
        }>
        <TabCard
          tabList={[
            {
              label: 'Contract Source Code',
              children: (
                <Form
                  className="mt-24 px-12"
                  layout="vertical"
                  form={form}
                  initialValues={{
                    contractAddress: contractAddress,
                    compiler: contractCompilerVersion,
                    optimization: false,
                    optimizeCount: 200,
                    evm: evmVersions?.[0],
                    license: LICENSE_TYPE_OPTIONS[0].split(') ')[1]
                  }}
                  onFinish={onPublish}
                  autoComplete="off">
                  {/* Common Data */}
                  <Row gutter={12}>
                    <Col span={isJsonType ? 12 : 10}>
                      <Form.Item label="Contract Address" name="contractAddress">
                        <Input readOnly></Input>
                      </Form.Item>
                    </Col>
                    <Col span={isJsonType ? 12 : 10}>
                      <Form.Item label="Compiler" name="compiler">
                        <Input readOnly></Input>
                      </Form.Item>
                    </Col>
                    {!isJsonType && (
                      <Col span={4}>
                        <Form.Item label="Optimization" name="optimization">
                          <Select>
                            <Select.Option value={true}>Yes</Select.Option>
                            <Select.Option value={false}>No</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    )}
                  </Row>

                  {/* Upload */}
                  <div className="mb-8px">
                    Please select the {isJsonType ? 'Standard-Input-Json' : 'Solidity'} (*.{isJsonType ? 'json' : 'sol'}) files for upload{' '}
                    <span className="text-red">*</span>
                  </div>
                  <div className="w-full mb-24">
                    <Upload.Dragger
                      className="!h-150px"
                      accept={isJsonType ? '.json' : '.sol'}
                      fileList={fileList}
                      beforeUpload={() => false}
                      onChange={info => {
                        if (info.fileList?.some(({ size }) => (size ?? 0) > (isJsonType ? 1024 * 1024 : 1024 * 500))) {
                          message.error(`File must smaller than ${isJsonType ? '1M' : '500KB'}!`)
                        }

                        const data: any = {}
                        info.fileList.filter(({ size }) => !((size ?? 0) > (isJsonType ? 1024 * 1024 : 1024 * 500))).forEach(file => (data[file.name] = file))

                        setFileList(Object.values(data))
                      }}
                      maxCount={isJsonType ? 1 : undefined}
                      multiple={isJsonType ? false : true}>
                      <span className="font-400 text-[#00000073]">
                        Click or drag file{isJsonType ? '' : 's'} to this area to upload. (Size limit: {isJsonType ? '1M' : '500KB'})
                      </span>
                    </Upload.Dragger>
                  </div>

                  {/* Contract Library Address */}
                  {!isJsonType && (
                    <Collapse className="w-full bg-white mb-24" expandIconPosition="end">
                      <Collapse.Panel
                        key="0"
                        header={
                          <>
                            <span>Contract Library Address </span>
                            <span className="text-secondText">(for contracts that use libraries, supports up to 10 libraries)</span>
                          </>
                        }>
                        <div className="text-secondText mb-18px">
                          <b>Note: Library names are case sensitive and affects the keccak library hash</b>
                        </div>
                        <>
                          {libraries?.map((data, index) => (
                            <Row key={index} className="mb-12" gutter={12}>
                              <Col span={8}>
                                <div className="text-secondText mb-8px">Library_{index + 1} Name:</div>
                                <Input value={data[0]} onChange={({ target }) => setLibraryInfo(index, 'key', target.value)}></Input>
                              </Col>
                              <div className="mx-12 pt-34px">
                                <Image width={24} src={getImgSrc('contract/arrow')} alt="" />
                              </div>
                              <Col span={8}>
                                <div className="text-secondText mb-8px">Library_{index + 1} Contract Address:</div>
                                <Input value={data[1]} onChange={({ target }) => setLibraryInfo(index, 'value', target.value)}></Input>
                              </Col>
                            </Row>
                          ))}
                        </>
                      </Collapse.Panel>
                    </Collapse>
                  )}

                  {/* Misc Settings */}
                  <Collapse className="w-full bg-white" expandIconPosition="end">
                    <Collapse.Panel key="0" header={`Misc Settings (${isJsonType ? 'License Type settings' : 'Runs, EvmVersion & License Type settings'})`}>
                      <Row gutter={12}>
                        {!isJsonType && (
                          <>
                            <Col span={8}>
                              <Form.Item label="Runs (Optimizer)" name="optimizeCount">
                                <Input></Input>
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item label="EVM Version to target" name="evm">
                                <Select>
                                  {evmVersions?.map((version: string) => (
                                    <Select.Option key={version}>{version}</Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                          </>
                        )}
                        <Col span={8}>
                          <Form.Item label="LicenseType" name="license">
                            <Select>
                              {LICENSE_TYPE_OPTIONS?.map(license => (
                                <Select.Option key={license} value={license.split(') ')[1]}>
                                  {license}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Collapse.Panel>
                  </Collapse>
                </Form>
              )
            }
          ]}
        />
      </VerifyContractPage>
      <Modal
        wrapClassName="modal-with-no-footer-border"
        open={showPublishResultModal}
        width={500}
        okText="Verify Again"
        footer={'fail' === publishResult ? undefined : null}
        onCancel={() => {
          if ('success' === publishResult) {
            router.push(generatePath(ROUTES.BLOCK_CHAIN.DETAIL.ADDRESS, { address: contractAddress }))
          }
          setShowPublishResultModal(false)
        }}
        onOk={() => form.submit()}
        closable={'loading' !== publishResult}
        maskClosable={false}
        centered>
        <div className="flexCenter flex-col py-30px">
          <Image
            style={{ animationDuration: '2s' }}
            className={classNames('mb-36px', 'loading' === publishResult && 'animate-spin')}
            width={94}
            src={getImgSrc(`contract/${'loading' === publishResult ? 'verify_loading' : 'fail' === publishResult ? 'verify_failed' : 'verify_success'}`)}
            alt=""
          />
          <div className="font-500 mb-4px">
            {'loading' === publishResult ? <DotText text="Waiting" /> : 'fail' === publishResult ? 'Sorry.' : 'Congratulation!'}
          </div>
          <div className="font-400">
            {'loading' === publishResult ? (
              <div>Your contract is under verification.</div>
            ) : 'fail' === publishResult ? (
              <>
                <div>Your contract has not verified.</div>
                <div className="mt-4px">Please check your submission again.</div>
              </>
            ) : (
              <div>Your contract has verified.</div>
            )}
          </div>
        </div>
      </Modal>
    </Container>
  )
}

export default ContractPublish
