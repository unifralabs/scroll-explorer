import { z } from 'zod'

import prisma from '../prisma'
import { publicProcedure, router } from '../trpc'

export const addressRouter = router({
  getAddressSummary: publicProcedure.input(z.string()).query(async ({ input }) => {
    const address = input.trim().toLowerCase()
    const summary = (await prisma.$queryRaw`
        SELECT 
            COALESCE((SELECT value FROM "accountBalance" WHERE address = ${address} AND contract = ''), '0') AS balance,
            (SELECT COUNT(*) FROM (
                SELECT "blockNumber" FROM transaction WHERE "from" = ${address}
                UNION ALL
                SELECT "blockNumber" FROM transaction WHERE "to" = ${address}
            ) AS subquery) AS transaction_count,
            (SELECT COUNT(*) FROM (
                SELECT "transactionHash" FROM "tokenTransfer" WHERE "from" = ${address}
                UNION ALL
                SELECT "transactionHash" FROM "tokenTransfer" WHERE "to" = ${address}
            ) AS subquery) AS token_transfer_count,
            (SELECT SUM("gasUsed") FROM transaction WHERE "from" = ${address}) AS gas_used,
            (SELECT "blockNumber" FROM transaction WHERE "from" = ${address} OR "to" = ${address} ORDER BY "blockNumber" DESC LIMIT 1) AS last_balance_update
        `) as any[]

    if (summary.length === 0) {
      return null
    }

    return summary[0]
  }),
  getAddressTokenBalance: publicProcedure
    .input(
      z.object({
        address: z.string(),
        tokenType: z.number().min(1).max(3).default(1)
      })
    )
    .query(async ({ input }) => {
      const address = input.address.toLowerCase()
      const balance = (await prisma.$queryRaw`
        SELECT 
            contract.name, 
            contract.symbol, 
            contract.decimals,
            contract."contractAddress", 
            "accountBalance".value, 
            "accountBalance"."tokenId", 
            "tokenListMaintain".logo_path 
        FROM 
            contract 
            LEFT OUTER JOIN "tokenListMaintain" 
                ON contract."contractAddress" = "tokenListMaintain".contract_address 
            INNER JOIN "accountBalance" 
                ON "accountBalance".contract = contract."contractAddress" 
        WHERE 
            "accountBalance".address = ${address}
            AND contract."contractType" = ${input.tokenType}
            AND "accountBalance".value > 0
        `) as any[]
      return balance
    }),
  getAddressTxList: publicProcedure
    .input(
      z.object({
        address: z.string(),
        offset: z.number().min(0).default(0),
        limit: z.number().min(0).default(10)
      })
    )
    .query(async ({ input }) => {
      const address = input.address.toLowerCase()
      const txsCount = (await prisma.$queryRaw`
                    SELECT COUNT(*)
                    FROM (
                        SELECT "blockNumber"
                        FROM transaction
                        WHERE "from" = ${address}
                        UNION ALL
                        SELECT "blockNumber"
                        FROM transaction
                        WHERE "to" = ${address}
                        AND "handled" = true
                    ) AS subquery;
                `) as any[]

      const txs = (await prisma.$queryRaw`
                    WITH limited_transaction AS (
                        SELECT *
                        FROM transaction 
                        WHERE "from" = ${address} OR "to" = ${address}
                        AND "handled" = true
                        ORDER BY "blockNumber" DESC, "transactionIndex" DESC
                        OFFSET ${input.offset} 
                        LIMIT ${input.limit}
                    )
                    SELECT limited_transaction.*, COALESCE(batch."status", 0) as "l1Status"
                    FROM limited_transaction
                    LEFT JOIN batch ON array [limited_transaction."blockNumber"] <@ (batch."blockNumbers")
                    `) as any[]

      return {
        count: txsCount[0].count,
        list: txs
      }
    }),
  getAddressTokenTxList: publicProcedure
    .input(
      z.object({
        address: z.string(),
        tokenType: z.number().min(1).max(3).default(1),
        offset: z.number().min(0).default(0),
        limit: z.number().min(0).default(10)
      })
    )
    .query(async ({ input }) => {
      const address = input.address.toLowerCase()
      const transferCount = (await prisma.$queryRaw`
                    SELECT COUNT(*)
                    FROM "tokenTransfer"
                    JOIN contract ON "tokenTransfer".contract = contract."contractAddress"
                    WHERE ("tokenTransfer".from = ${address} OR "tokenTransfer".to = ${address})
                    AND "tokenTransfer"."tokenType" = ${input.tokenType}
                    `) as any[]
      const transfers = (await prisma.$queryRaw`
                    SELECT "tokenTransfer".*, contract.name, contract.symbol, contract.decimals, "tokenListMaintain".logo_path 
                    FROM "tokenTransfer" 
                    LEFT OUTER JOIN "tokenListMaintain" 
                    ON "tokenTransfer".contract = "tokenListMaintain".contract_address 
                    JOIN contract 
                    ON "tokenTransfer".contract = contract."contractAddress" 
                    WHERE ("tokenTransfer".from = ${address} OR "tokenTransfer".to = ${address}) 
                    AND "tokenTransfer"."tokenType" = ${input.tokenType}
                    ORDER BY "tokenTransfer"."blockTime" DESC, "tokenTransfer"."logIndex" ASC 
                    OFFSET ${input.offset}
                    LIMIT ${input.limit}
                    `) as any[]
      return {
        count: transferCount[0].count,
        list: transfers
      }
    }),
  getAddressInternalTxList: publicProcedure
    .input(
      z.object({
        address: z.string(),
        offset: z.number().min(0).default(0),
        limit: z.number().min(0).default(10)
      })
    )
    .query(async ({ input }) => {
      const address = input.address.toLowerCase()
      const txsCount = (await prisma.$queryRaw`
                        SELECT COUNT(*) 
                        FROM "internalTransaction" 
                        INNER JOIN block 
                        ON "internalTransaction"."blockHash" = block."blockHash" 
                        WHERE ("internalTransaction".from = ${address} OR "internalTransaction".to = ${address})
                        `) as any[]
      const txs = await prisma.$queryRaw`
                        SELECT "internalTransaction".*, block."blockTime" 
                        FROM "internalTransaction", block 
                        WHERE "internalTransaction"."blockHash" = block."blockHash" 
                        AND ("internalTransaction".from = ${address} OR "internalTransaction".to = ${address})
                        ORDER BY "internalTransaction"."blockNumber" DESC
                        OFFSET ${input.offset}
                        LIMIT ${input.limit}
                        `
      return {
        count: txsCount[0].count,
        list: txs
      }
    })
})
