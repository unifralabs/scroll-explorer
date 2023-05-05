import { useId, useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import { SwapRightOutlined } from '@ant-design/icons'
import { scrollTestnet } from '@wagmi/core/chains'
import { Button, Input } from 'antd'
import { BigNumber } from 'ethers'
import { useAccount, useConnect, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

export function formatResponseData(data: unknown): string {
  if (BigNumber.isBigNumber(data)) {
    data = data.toString()
  }

  if (typeof data === 'object') {
    const receipt: any = (data as any).receipt
    if (receipt) {
      data = {
        to: receipt.to,
        from: receipt.from,
        transactionHash: receipt.transactionHash,
        events: receipt.events
      }
    }
  }

  return JSON.stringify(data, null, 2)
}

export function formatError(error: Error): string {
  if ((error as any).reason) {
    return (error as any).reason
  }

  try {
    return JSON.stringify(error)
  } catch {
    return error.toString()
  }
}

function formatContractCall(
  params: {
    key: string
    value: string
    type: string
    components:
      | {
          [x: string]: any
          type: string
          name?: string
        }[]
      | undefined
  }[],
  value?: BigNumber
) {
  const parsedParams = params
    .map(p => (p.type === 'bool' ? (p.value === 'false' ? false : true) : p.value))
    .map(p => {
      try {
        const parsed = JSON.parse(p as string)
        if (Array.isArray(parsed) || typeof parsed === 'object') {
          return parsed
        } else {
          // Return original value if its not an array or object
          return p
        }
      } catch {
        // JSON.parse on string will throw an error
        return p
      }
    })

  if (value) {
    parsedParams.push({
      value
    })
  }

  return parsedParams
}

interface InteractiveAbiFunctionProps {
  index: number
  abiFunction: any
  contract: any
  abi: any
  type: 'read' | 'write'
}

export const InteractiveAbiFunction: React.FC<InteractiveAbiFunctionProps> = ({ abiFunction, contract, abi, type }) => {
  const formId = useId()
  const form = useForm({
    defaultValues: {
      params:
        abiFunction?.inputs.map((i: any) => ({
          key: i.name || '<input>',
          value: '',
          type: i.type,
          components: i.components
        })) || [],
      value: '0'
    }
  })
  const { fields } = useFieldArray({
    control: form.control,
    name: 'params'
  })
  const { isConnected } = useAccount()
  const { connect, error: connectError } = useConnect({ connector: new InjectedConnector() })

  const [args, setArgs] = useState<any[]>([])
  const [readEnabled, setReadEnabled] = useState(false)
  const {
    data: readData,
    isLoading: readLoading,
    error: readError
  } = useContractRead({
    address: contract.address,
    abi: abi,
    functionName: abiFunction.name,
    enabled: readEnabled,
    args: args,
    overrides: {
      value: Number(form.getValues('value'))
    }
  })
  const { config, error: prepareError } = usePrepareContractWrite({
    address: contract.address,
    abi: abi,
    functionName: abiFunction.name,
    args: args,
    chainId: scrollTestnet.id
  })
  const { data: writeData, isLoading: writeLoading, write, error: writeError } = useContractWrite(config)

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-2 justify-between"
        id={formId}
        onSubmit={form.handleSubmit(d => {
          if (d.params) {
            const formatted = formatContractCall(d.params)
            setArgs(formatted)
            type === 'read' ? setReadEnabled(true) : isConnected ? write?.() : connect()
          }
        })}>
        {fields.length > 0 &&
          fields.map((item: any, index: number) => {
            return (
              <div
                key={item.id}
                className={`mb-8 flex flex-col space-y-2 ${form.getFieldState(`params.${index}.value`, form.formState).error ? 'border-red' : ''}`}>
                <span className="text-sm">{`${item.key} (${item.type})`}</span>
                <Input
                  className="text-gray-400"
                  {...form.register(`params.${index}.value`)}
                  placeholder={`${item.key} (${item.type})`}
                  onChange={e => form.setValue(`params.${index}.value`, e.target.value)}
                />

                <div className="text-red">{form.getFieldState(`params.${index}.value`, form.formState).error?.message}</div>
              </div>
            )
          })}

        {abiFunction?.stateMutability === 'payable' && (
          <div className="mb-8">
            <div className="flex flex-col space-y-2">
              <label>Native Token Value</label>
              <Input {...form.register(`value`)} placeholder="wei" onChange={e => form.setValue(`value`, e.target.value)} />
            </div>
          </div>
        )}

        {type === 'read' ? (
          readData == undefined && (
            <Button disabled={!abiFunction} loading={readLoading} htmlType="submit" form={formId} className="mr-auto mb-3">
              Query
            </Button>
          )
        ) : (
          <Button disabled={!abiFunction} loading={writeLoading} htmlType="submit" form={formId} className="mr-auto mb-3">
            Write
          </Button>
        )}

        <div className="flex space-x-2">
          {abiFunction?.outputs &&
            abiFunction.outputs.map((output: any, index: number) => (
              <div className="flex space-x-1 text-gray-500" key={index}>
                <SwapRightOutlined />
                <span className="text-sm">{output.type}</span>
              </div>
            ))}
          {readError || prepareError || writeError || connectError ? (
            <div>
              <code className="p-4 w-full text-red relative">Error: {formatError((readError || prepareError || writeError || connectError) as any)}</code>
            </div>
          ) : readData !== undefined || writeData !== undefined ? (
            <div>{formatResponseData(readData || writeData)}</div>
          ) : null}
        </div>
      </form>
    </FormProvider>
  )
}
