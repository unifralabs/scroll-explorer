import { Prisma, PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'> | undefined
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query'
      },
      {
        emit: 'stdout',
        level: 'error'
      },
      {
        emit: 'stdout',
        level: 'info'
      },
      {
        emit: 'stdout',
        level: 'warn'
      }
    ]
  })

if (process.env.NODE_ENV === 'development') global.prisma = prisma

export default prisma

prisma.$on('query', e => {
  const color = e.duration > 5000 ? '\x1b[31m%s\x1b[0m' : '%s'
  console.log(color, 'Query: ' + e.query)
  console.log(color, 'Params: ' + e.params)
  console.log(color, 'Duration: ' + e.duration + 'ms')
})

export const getBlockHeight = async (): Promise<number> => {
  const height = await prisma.block.aggregate({
    _max: {
      blockNumber: true
    }
  })

  return Number(height._max.blockNumber)
}

export const getEstimatedTransactionCount = async (): Promise<number> => {
  const res = (await prisma.$queryRaw`
    SELECT reltuples::bigint AS estimate
    FROM pg_class
    WHERE relname = 'transaction';
  `) as { estimate: string }[]

  return Number(res[0].estimate)
}

export const getEstimatedInternalTransactionCount = async (): Promise<number> => {
  const res = (await prisma.$queryRaw`
    SELECT reltuples::bigint AS estimate
    FROM pg_class
    WHERE relname = 'internalTransaction';
  `) as { estimate: string }[]
  return Number(res[0].estimate)
}

export const insertVerifyStatus = async (uid: string, status: number, contractAddress: string): Promise<void> => {
  await prisma.contractVerifyJob.create({
    data: {
      uid,
      contractAddress: contractAddress.toLowerCase(),
      status
    }
  })
}

export const updateVerifyStatus = async (uid: string, status: number): Promise<void> => {
  await prisma.contractVerifyJob.update({
    where: {
      uid
    },
    data: {
      status
    }
  })
}

export const updateContract = async (address: string, source: any, input: string): Promise<any> => {
  const compilerSettings = JSON.parse(source.compilerSettings)
  const optimizationEnabled = compilerSettings.optimizer.enabled
  const optimizationRuns = compilerSettings.optimizer.runs

  return await prisma.contract.update({
    where: {
      contractAddress: address.toLowerCase()
    },
    data: {
      status: 1,
      contractABI: source.abi,
      standardJson: input,
      compiler: source.compilerVersion,
      license: 'No license (None)',
      optimizationEnabled: optimizationEnabled ? 'Yes with ' + optimizationRuns + ' runs' : 'No',
      evmVersion: 'default(compiler defaults)'
    }
  })
}

export const getByteCode = async (contractAddress: string): Promise<string> => {
  const code = await prisma.contract.findFirst({
    where: {
      contractAddress: contractAddress.toLowerCase()
    },
    select: {
      byteCode: true
    }
  })

  return code?.byteCode ?? ''
}
