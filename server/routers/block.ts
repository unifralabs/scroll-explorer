import { isHexString } from '@ethersproject/bytes'
import { z } from 'zod'

import prisma, { getBlockHeight } from '../prisma'
import { publicProcedure, router } from '../trpc'

export const blockRouter = router({
  getBlockHeight: publicProcedure.query(async () => {
    return await getBlockHeight()
  }),
  getFinalizedBlockHeight: publicProcedure.query(async () => {
    const res = (await prisma.$queryRaw`
            SELECT (SELECT MAX(a) FROM unnest("blockNumbers") a) AS highest 
            FROM batch 
            WHERE status = 2 
            ORDER BY idx DESC 
            LIMIT 1;
        `) as { highest: number }[]
    return res[0].highest || 0
  }),
  getBlockCount: publicProcedure.query(async () => {
    return await prisma.block.count()
  }),
  getBlockList: publicProcedure
    .input(
      z.object({
        // # order by blockNumber
        // # 0: asc by blockNumber
        // # 1: desc by blockNumber (default)
        order: z.number().min(0).max(1).default(1),
        blockNumbers: z.array(z.number()).optional(),
        page: z.number().min(1).default(1),
        offset: z.number().optional().default(0),
        limit: z.number().optional().default(20)
      })
    )
    .query(async ({ input }) => {
      const orderBy = input.order === 1 ? 'block."blockNumber" DESC' : 'block."blockNumber" ASC'
      const limitClause = `LIMIT ${input.limit}`
      let blockNumberFilter = ''
      if (input.blockNumbers) {
        blockNumberFilter = `AND block."blockNumber" IN (${input.blockNumbers.join(',')})`
      }
      if (input.page) {
        const height = await getBlockHeight()
        blockNumberFilter += `AND block."blockNumber" ${input.order === 1 ? '<' : '>'} ${(height - (input.page - 1)) * input.limit}`
      }
      const offsetClause = input.offset === 0 ? '' : `OFFSET ${input.offset}`
      const sql = `
        SELECT block.*,
          batch."commitHash" as "l1CommitTransactionHash",
          batch."proofHash" as "l1FinalizeTransactionHash",
          COALESCE(batch."status", 0) as "l1Status"
        FROM block
        LEFT JOIN batch ON array [block."blockNumber"] <@ (batch."blockNumbers")
        WHERE 1=1 ${blockNumberFilter}
        ORDER BY ${orderBy}
        ${limitClause}
        ${offsetClause}
      `
      const count = input.blockNumbers ? input.blockNumbers.length : await prisma.block.count()
      const blockList = await prisma.$queryRawUnsafe(sql)
      return {
        count,
        list: blockList
      }
    }),
  getBlockDetail: publicProcedure
    .input(
      z.object({
        identity: z.union([z.string(), z.number()])
      })
    )
    .query(async ({ input }) => {
      const whereFilter = isHexString(input.identity) ? `WHERE "blockHash" = '${input.identity}'` : `WHERE "blockNumber" = ${input.identity}`
      const querySql = `
      WITH block_data AS (
      SELECT block.*,
              COALESCE(batch."status", 0) as "l1Status"
      FROM block
      LEFT JOIN batch ON ARRAY [block."blockNumber"] <@ (batch."blockNumbers")
      ${whereFilter}    ),
      transaction_count AS (
      SELECT COUNT(*) as count
      FROM public."internalTransaction"
      ${whereFilter}
      )
      SELECT (SELECT count FROM transaction_count) as "internalTransactionCountJoined",
          block_data.*
      FROM block_data
    `

      const blocks = (await prisma.$queryRawUnsafe(querySql)) as any[]
      if (blocks.length === 0) {
        return null
      }
      return blocks[0]
    })
})
