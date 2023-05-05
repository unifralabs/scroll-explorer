import { z } from 'zod'

import { VerifyStatus } from '@/constants/api'
import { ContractDetailType } from '@/types'
import { generateUid } from '@/utils'
import { VerifyJobType, queue } from '@/worker'

import prisma from '../prisma'
import { publicProcedure, router } from '../trpc'
import { getCompilerVersions } from '../verify'

export const contractRouter = router({
  getContractDetail: publicProcedure.input(z.string()).query(async ({ input }) => {
    const address = input.trim().toLowerCase()
    const contract = (await prisma.$queryRaw`
            SELECT contract.*, "tokenListMaintain".logo_path
            FROM contract
            LEFT OUTER JOIN "tokenListMaintain"
            ON contract."contractAddress" = "tokenListMaintain".contract_address
            WHERE contract."contractAddress" = ${address}
            `) as ContractDetailType[]
    if (contract.length === 0) {
      return null
    }
    return contract[0]
  }),
  getContractTransactionList: publicProcedure
    .input(
      z.object({
        address: z.string(),
        offset: z.number().default(0),
        limit: z.number().default(10)
      })
    )
    .query(async ({ input }) => {
      const address = input.address.trim().toLowerCase()

      const txCount = (await prisma.$queryRaw`
            SELECT COUNT(*)
            FROM transaction
            WHERE transaction."to" = ${address}
            `) as any[]

      const txList = (await prisma.$queryRaw`
            SELECT transaction.*
            FROM transaction
            WHERE transaction."to" = ${address} AND transaction."handled" = true
            ORDER BY transaction."blockNumber" DESC, transaction."transactionIndex" ASC
            OFFSET ${input.offset} LIMIT ${input.limit}
            `) as any[]

      return {
        count: txCount[0].count,
        list: txList
      }
    }),

  getCompilerVersions: publicProcedure.query(async () => {
    const res = await getCompilerVersions()
    const jsonRes = await res.json()
    return jsonRes.compilerVersions
  }),
  verifyMultiPart: publicProcedure
    .input(
      z.object({
        contractAddress: z.string().length(42),
        compilerVersion: z.string(),
        sourceFiles: z.any(),
        evmVersion: z.string().optional(),
        optimizationRuns: z.number().optional(),
        libraries: z.record(z.string(), z.string()).optional()
      })
    )
    .output(
      z.object({
        message: z.string(),
        result: z.string(),
        status: z.string()
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Check if contract is already verified

      const uid = generateUid(input.contractAddress)
      await queue.add(VerifyJobType.SolidityVerifyMultiPart, {
        type: 'json_api',
        params: input,
        uid
      })

      return {
        message: 'OK',
        result: uid,
        status: '1'
      }
    }),
  // Etherscan style api for contract verification
  // ?module=contract&action=verifysourcecode&codeformat={solidity-standard-json-input}&contractaddress={contractaddress}&contractname={contractname}&compilerversion={compilerversion}&sourceCode={sourceCode}
  verifyStandardJson: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/contract',
        tags: ['contract'],
        summary: 'Etherscan style api for contract verification - verifysourcecode'
      }
    })
    .input(
      z.object({
        module: z.literal('contract'),
        action: z.literal('verifysourcecode'),
        contractaddress: z.string().length(42),
        sourceCode: z.string(),
        codeformat: z.literal('solidity-standard-json-input'),
        contractname: z.string(),
        compilerversion: z.string(),
        constructorArguements: z.string().optional()
      })
    )
    .output(
      z.object({
        message: z.string(),
        result: z.string(),
        status: z.string()
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Check if contract is already verified

      const uid = generateUid(input.contractaddress)
      await queue.add(VerifyJobType.SolidityVerifyStandardJson, {
        type: 'json_api',
        params: {
          contractaddress: input.contractaddress,
          contractname: input.contractname,
          compilerversion: input.compilerversion,
          constructorArguements: input.constructorArguements
        },
        sourceCode: input.sourceCode,
        uid
      })

      return {
        message: 'OK',
        result: uid,
        status: '1'
      }
    }),
  // ?module=contract&action=checkverifystatus&guid=0x95ad51f4406bf2AF31e3A2e2d75262EE19432261643b13f1
  checkverifystatus: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/contract',
        tags: ['contract'],
        summary: 'Etherscan style api for contract verification - checkverifystatus'
      }
    })
    .input(
      z.object({
        module: z.literal('contract'),
        action: z.literal('checkverifystatus'),
        guid: z.string()
      })
    )
    .output(
      z.object({
        message: z.string(),
        result: z.string(),
        status: z.string()
      })
    )
    .query(async ({ input }) => {
      const status = await prisma.contractVerifyJob.findFirst({
        where: {
          uid: input.guid
        },
        select: {
          status: true
        }
      })
      let result = 'Pending in queue'
      switch (status?.status) {
        case VerifyStatus.Pass: {
          result = 'Pass - Verified'
          break
        }
        case VerifyStatus.Pending: {
          result = 'Pending in queue'
          break
        }
        case VerifyStatus.Fail: {
          result = 'Fail - Unable to verify'
          break
        }
      }

      return {
        message: 'OK',
        result: result,
        status: '1'
      }
    })
})
