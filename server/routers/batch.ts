import { z } from 'zod'

import prisma from '../prisma'
import { publicProcedure, router } from '../trpc'

export const batchRouter = router({
  getBatchCount: publicProcedure.query(async () => {
    return prisma.batch.count()
  }),
  getBatchList: publicProcedure
    .input(
      z.object({
        offset: z.number().optional().default(0),
        limit: z.number().optional().default(20)
      })
    )
    .query(async ({ input }) => {
      const batchList = await prisma.$queryRaw`
                     SELECT
                        idx,
                        "batchHash",
                        "commitHash",
                        extract(epoch from "commitTime") AS "commitTime",
                        "proofHash",
                        extract(epoch from "proofTime") AS "proofTime",
                        "blockNumbers",
                        "blockCount",
                        "transactionCount",
                        status
                    FROM batch
                    ORDER BY idx DESC
                    LIMIT ${input.limit} OFFSET ${input.offset}
                    `
      const batchCount = await prisma.batch.count()
      return {
        count: batchCount,
        list: batchList
      }
    }),
  getBatchDetail: publicProcedure.input(z.number()).query(async ({ input }) => {
    const batchs = (await prisma.$queryRaw`
            SELECT
                idx,
                "batchHash",
                "commitHash",
                extract(epoch from "commitTime") AS "commitTime",
                "proofHash",
                extract(epoch from "proofTime") AS "proofTime",
                "blockNumbers",
                "blockCount",
                "transactionCount",
                status
            FROM batch
            WHERE idx = ${input}
            `) as any[]
    if (batchs.length === 0) {
      return null
    }
    const batch = batchs[0]
    return batch
  })
})
