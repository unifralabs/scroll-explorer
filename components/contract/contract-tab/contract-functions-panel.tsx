import React, { useMemo } from 'react'

import { ArrowRightOutlined } from '@ant-design/icons'
import { Collapse } from 'antd'

import { InteractiveAbiFunction } from './contract-function'

interface ContractFunctionsPanelProps {
  contract: any
  abi: any
  type: 'read' | 'write'
}

const ContractFunctionsPanel: React.FC<ContractFunctionsPanelProps> = ({ contract, abi, type }) => {
  const fns = Object.values(contract?.interface?.functions ?? {})
  const writeFunctions = useMemo(() => {
    return fns?.filter((fn: any) => fn.stateMutability !== 'pure' && fn.stateMutability !== 'view' && 'stateMutability' in fn)
  }, [fns])
  const viewFunctions = useMemo(() => {
    return fns?.filter((fn: any) => fn.stateMutability === 'pure' || fn.stateMutability === 'view')
  }, [fns])
  if (!fns) {
    return null
  }

  return (
    <Collapse className="my-24 bg-white shadow-none" expandIconPosition="end" expandIcon={({ isActive }) => <ArrowRightOutlined rotate={isActive ? 90 : 0} />}>
      {type === 'read'
        ? viewFunctions.map((fn: any, index: number) => (
            <Collapse.Panel header={`${index + 1}. ${fn.name}`} key={index} className="mb-3 shadow-sm">
              <InteractiveAbiFunction abiFunction={fn} contract={contract} abi={abi} type={type} />
            </Collapse.Panel>
          ))
        : writeFunctions.map((fn: any, index: number) => (
            <Collapse.Panel header={`${index + 1}. ${fn.name}`} key={index} className="mb-3 shadow-sm">
              <InteractiveAbiFunction abiFunction={fn} contract={contract} abi={abi} type={type} />
            </Collapse.Panel>
          ))}
    </Collapse>
  )
}

export default ContractFunctionsPanel
