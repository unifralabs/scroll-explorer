import { z } from 'zod'

import prisma from '../prisma'
import { publicProcedure, router } from '../trpc'

export const statRouter = router({
  getDailyTxCount: publicProcedure
    .input(
      z.object({
        timeStart: z.number(),
        timeEnd: z.number()
      })
    )
    .query(async ({ input }) => {
      const res = (await prisma.$queryRaw`
                          SELECT * FROM daily_transaction_count 
                          WHERE date >= TO_CHAR(to_timestamp(${input.timeStart}), 'YYYY-MM-DD')
                          AND date <= TO_CHAR(to_timestamp(${input.timeEnd}), 'YYYY-MM-DD')
                          ORDER BY date ASC
                      `) as { date: string; count: number }[]
      return res
    }),

  getDailyTokenTransferCount: publicProcedure
    .input(
      z.object({
        tokenType: z.number(),
        timeStart: z.number(),
        timeEnd: z.number()
      })
    )
    .query(async ({ input }) => {
      const res = (await prisma.$queryRaw`
                          SELECT * FROM daily_token_transfer_counts
                          WHERE date >= TO_CHAR(to_timestamp(${input.timeStart}), 'YYYY-MM-DD')
                          AND date <= TO_CHAR(to_timestamp(${input.timeEnd}), 'YYYY-MM-DD')
                          AND "tokenType" = ${input.tokenType}
                          ORDER BY date ASC
                      `) as { date: string; count: number }[]
      return res
    }),

  getUniqueAddressesCount: publicProcedure
    .input(
      z.object({
        timeStart: z.number(),
        timeEnd: z.number()
      })
    )
    .query(async ({ input }) => {
      const res = (await prisma.$queryRaw`
                          SELECT * FROM daily_unique_address_count
                          WHERE date >= TO_CHAR(to_timestamp(${input.timeStart}), 'YYYY-MM-DD')
                          AND date <= TO_CHAR(to_timestamp(${input.timeEnd}), 'YYYY-MM-DD')
                          ORDER BY date ASC
                      `) as { date: string; count: number }[]
      return res
    })
})
