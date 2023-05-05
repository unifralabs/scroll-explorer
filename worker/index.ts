import { Queue, Worker } from 'bullmq'

import { VerifyStatus } from '@/constants/api'
import { getByteCode, insertVerifyStatus, updateContract, updateVerifyStatus } from '@/server/prisma'
import { VerifyMultiPartParams, VerifyStandardJsonInputParams, verifyMultiPart, verifyStandardJsonInput } from '@/server/verify'

export interface VerifyJob {
  type: string
  params: SolidityStandardJsonVerifyParams | SolidityMultiPartVerifyParams
  sourceCode: string
  uid: string
}

export type SolidityStandardJsonVerifyParams = {
  contractaddress: string
  contractname: string
  compilerversion: string
  constructorArguements: unknown[] // You may replace this with a more specific type
}

export type SolidityMultiPartVerifyParams = {
  contractAddress: string
  compilerVersion: string
  evmVersion?: string
  optimizationRuns?: number
  sourceFiles: Record<string, string>
  libraries?: Record<string, string>
}

export const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379')
} as const

// queue
export const queueName = 'VerifyContract'
export const queue = new Queue(queueName, { connection })
export enum VerifyJobType {
  SolidityVerifyStandardJson = 'SolidityVerifyStandardJson',
  SolidityVerifyMultiPart = 'SolidityVerifyMultiPart'
}

const updateContractInfo = async (res: Response, job: any, contractAddress: string): Promise<void> => {
  try {
    const resData = await (res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text())
    if (res.ok && resData.status === 'SUCCESS') {
      await Promise.all([updateContract(contractAddress, resData.source, job.data.sourceCode), updateVerifyStatus(job.data.uid, VerifyStatus.Pass)])
    } else {
      console.error(`❌ Worker ${worker.name} job w${job?.id} - ${job?.name} failed(res): ${JSON.stringify(resData)}`)
      await updateVerifyStatus(job.data.uid, VerifyStatus.Fail)
    }
  } catch (err) {
    console.error(`❌ Worker ${worker.name} job ${job?.id} - ${job?.name} failed: ${err}`)
    await updateVerifyStatus(job.data.uid, VerifyStatus.Fail)
  }
}

// worker
export const worker = new Worker<VerifyJob, any>(
  queueName,
  async job => {
    switch (job.name) {
      case VerifyJobType.SolidityVerifyStandardJson: {
        // insert status
        const verifyParams = job.data.params as SolidityStandardJsonVerifyParams
        await insertVerifyStatus(job.data.uid, VerifyStatus.Pending, verifyParams.contractaddress)

        const bytecode = await getByteCode(verifyParams.contractaddress)
        const params: VerifyStandardJsonInputParams = {
          bytecode,
          bytecodeType: 'CREATION_INPUT', // TODO: support DEPLOYED_BYTECODE
          compilerVersion: verifyParams.compilerversion,
          input: job.data.sourceCode
        }
        const res = await verifyStandardJsonInput(params)
        await updateContractInfo(res, job, verifyParams.contractaddress)
        break
      }
      case VerifyJobType.SolidityVerifyMultiPart: {
        // insert status
        const { contractAddress, ...verifyParams } = job.data.params as SolidityMultiPartVerifyParams
        await insertVerifyStatus(job.data.uid, VerifyStatus.Pending, contractAddress)

        const bytecode = await getByteCode(contractAddress)
        const params: VerifyMultiPartParams = {
          bytecode,
          bytecodeType: 'CREATION_INPUT', // TODO: support DEPLOYED_BYTECODE
          ...verifyParams
        }
        const res = await verifyMultiPart(params)
        await updateContractInfo(res, job, contractAddress)
        break
      }
      default:
        console.log(worker.name, 'Got job with unknown name', job.name)
        break
    }
  },
  { connection }
)

worker.on('completed', job => {
  console.info('🎉 Worker', worker.name, 'job', job.id, '-', job.name, 'completed')
})
worker.on('failed', (job, err) => {
  console.error('❌ Worker', worker.name, 'job', job?.id, '-', job?.name, 'failed', err)
})
worker.on('error', err => {
  console.error('🔥 Worker', worker.name, 'error', err)
})
worker.on('stalled', jobId => {
  console.warn('🚨 Worker', worker.name, 'job', jobId, 'stalled')
})
// worker.on('active', job => {
// console.info('Worker', worker.name, 'job', job.id, 'active')
// })
worker.on('paused', () => {
  console.warn('⏸️ Worker', worker.name, 'paused')
})
// worker.on('drained', () => {
// console.warn('Worker', worker.name, 'drained')
// })
