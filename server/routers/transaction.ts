import { z } from 'zod'

import prisma, { getEstimatedInternalTransactionCount, getEstimatedTransactionCount } from '../prisma'
import { publicProcedure, router } from '../trpc'

export const transactionRouter = router({
  getTransactionCount: publicProcedure.query(async () => {
    return await getEstimatedTransactionCount()
  }),
  getTransactionList: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
        cursor: z.number().optional()
      })
    )
    .query(async ({ input }) => {
      let WhereOrderClause = ''

      if (input.cursor != undefined) {
        if (input.cursor === 0) {
          WhereOrderClause = `ORDER BY "id" ASC`
        } else {
          WhereOrderClause = `AND "id" < ${input.cursor} ORDER BY "id" DESC`
        }
      } else {
        WhereOrderClause = `ORDER BY "id" DESC`
      }

      const txCountPromise = getEstimatedTransactionCount()
      const resPromise = prisma.$queryRawUnsafe(`
          WITH limited_transaction AS (
            SELECT *
            FROM transaction
            WHERE "handled" = true 
            ${WhereOrderClause}
            LIMIT ${input.limit}
          )
          SELECT limited_transaction.*,
            batch."commitHash" as "l1CommitTransactionHash",
            batch."proofHash" as "l1FinalizeTransactionHash",
            COALESCE(batch."status", 0) as "l1Status"
          FROM limited_transaction
          LEFT JOIN batch ON array [limited_transaction."blockNumber"] <@ (batch."blockNumbers")
          ORDER BY "blockNumber" DESC, "transactionIndex" DESC
        `)

      const [txCount, rawRes] = await Promise.all([txCountPromise, resPromise])
      const res = rawRes as any[]
      return {
        count: txCount,
        list: res,
        cursor: input.cursor ? input.cursor - input.limit : res.length > 0 ? res[res.length - 1].id : 0
      }
    }),
  getPendingTransactionList: publicProcedure
    .input(
      z.object({
        // # order by blockNumber
        // # 0: asc by blockNumber
        // # 1: desc by blockNumber (default)
        offset: z.number().optional().default(0),
        limit: z.number().optional().default(20)
      })
    )
    .query(async ({ input }) => {
      // TODO: support pending txs
      return {
        count: 0,
        list: []
      }
    }),
  getBlockTransactionList: publicProcedure
    .input(
      z.object({
        identity: z.union([z.string(), z.number()])
      })
    )
    .query(async ({ input }) => {
      return await prisma.transaction.findMany({
        where: {
          ...(typeof input.identity === 'string' ? { blockHash: input.identity.trim().toLowerCase() } : { blockNumber: input.identity })
        },
        orderBy: { transactionIndex: 'asc' }
      })
    }),
  getTransactionDetail: publicProcedure.input(z.string()).query(async ({ input }) => {
    const txs = (await prisma.$queryRaw`
          SELECT transaction.*,
          COALESCE(batch.status, 0) AS "l1Status"
          FROM transaction
          LEFT JOIN block ON transaction."blockNumber" = block."blockNumber"
          LEFT JOIN batch ON array [block."blockNumber"] <@ (batch."blockNumbers")
          where transaction.hash = ${input}
      `) as any[]

    const transfers = (await prisma.$queryRaw`
          SELECT
          "tokenTransfer".contract,
          contract.name,
          contract.symbol,
          contract.decimals,
          "tokenTransfer".from,
          "tokenTransfer".to,
          "tokenTransfer".value,
          "tokenTransfer"."tokenId",
          "tokenListMaintain".logo_path
        FROM
          "tokenTransfer"
          LEFT OUTER JOIN contract ON "tokenTransfer".contract = contract."contractAddress"
          LEFT OUTER JOIN "tokenListMaintain" ON "tokenTransfer".contract = "tokenListMaintain".contract_address
        WHERE
          "tokenTransfer"."transactionHash" = ${input}
          AND "tokenTransfer"."tokenType" IN (1, 2, 3)
          AND "tokenTransfer".contract = contract."contractAddress"
      `) as any[]

    if (txs.length === 0) {
      return null
    }

    const tx = txs[0]
    tx.tokenTransfer = []
    for (const transfer of transfers) {
      tx.tokenTransfer.push(transfer)
    }

    if (tx.crossType > 0) {
      const crossTx = (await prisma.$queryRaw`
              SELECT 
                "crossTransaction".type, 
                "crossTransaction"."l1TransactionHash", 
                "crossTransaction"."l1Token", 
                "crossTransaction"."l2Token", 
                "crossTransaction".from, 
                "crossTransaction".to, 
                "crossTransaction".amount, 
                contract.name, 
                contract.symbol, 
                contract.decimals, 
                "tokenListMaintain".logo_path 
            FROM "crossTransaction" 
            LEFT OUTER JOIN contract 
                ON "crossTransaction"."l2Token" = contract."contractAddress" 
            LEFT OUTER JOIN "tokenListMaintain" 
                ON "crossTransaction"."l2Token" = "tokenListMaintain".contract_address 
            WHERE "crossTransaction"."l2TransactionHash" = ${input}
        `) as any[]
      tx.crossTransfer = crossTx.map(item => {
        if (item.l1Token === '') {
          item.name = 'Ethereum'
          item.symbol = 'ETH'
          item.decimals = 18
        }
        return item
      })
    }
    return tx
  }),
  getInternalTransactionDetail: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await prisma.internalTransaction.findMany({
      where: { parentTransactionHash: input.trim().toLowerCase() }
    })
  }),
  getTransactionLogs: publicProcedure.input(z.string()).query(async ({ input }) => {
    const logs = (await prisma.$queryRaw`
      SELECT * FROM "transactionLogs" WHERE "transactionHash" = ${input.trim().toLowerCase()} ORDER BY "logIndex" ASC
    `) as any[]
    return logs.map(log => {
      return {
        ...log,
        topics: log.topics ? log.topics.split(',') : []
      }
    })
  }),
  getInternalTransactionList: publicProcedure
    .input(
      z.object({
        identity: z.union([z.string(), z.number()]).optional(),
        offset: z.number().optional().default(0),
        limit: z.number().optional().default(20)
      })
    )
    .query(async ({ input }) => {
      let countPromise
      if (input.identity) {
        let countSql = `SELECT COUNT(*) FROM "internalTransaction"`
        if (typeof input.identity === 'string') {
          countSql += ` WHERE "blockHash" = ${input.identity}`
        }
        if (typeof input.identity === 'number') {
          countSql += ` WHERE "blockNumber" = ${input.identity}`
        }

        countPromise = prisma.$queryRawUnsafe(countSql)
      } else {
        countPromise = getEstimatedInternalTransactionCount()
      }

      let internalTxsSql = `
        SELECT "internalTransaction".*, block."blockTime"
        FROM "internalTransaction"
        INNER JOIN block ON "internalTransaction"."blockHash" = block."blockHash"
      `
      if (typeof input.identity === 'string') {
        internalTxsSql += ` WHERE "internalTransaction"."blockHash" = ${input.identity}`
      }
      if (typeof input.identity === 'number') {
        internalTxsSql += ` WHERE "internalTransaction"."blockNumber" = ${input.identity}`
      }
      internalTxsSql += ` ORDER BY "internalTransaction"."blockNumber" DESC OFFSET ${input.offset} LIMIT ${input.limit}`
      const internalTxsPromise = prisma.$queryRawUnsafe(internalTxsSql)

      const [count, internalTxs] = await Promise.all([countPromise, internalTxsPromise])

      return {
        count: count,
        list: internalTxs
      }
    })
})
