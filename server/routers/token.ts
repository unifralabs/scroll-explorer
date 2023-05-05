import { z } from 'zod'

import prisma from '../prisma'
import { publicProcedure, router } from '../trpc'

export const tokenRouter = router({
  getTokenDetail: publicProcedure.input(z.string()).query(async ({ input }) => {
    const address = input.trim().toLowerCase()
    const [contract, accountBalanceCount] = await Promise.all([
      prisma.$queryRaw`
            SELECT contract.*, "tokenListMaintain".tag, "tokenListMaintain".logo_path
            FROM contract
            LEFT OUTER JOIN "tokenListMaintain" ON contract."contractAddress" = "tokenListMaintain".contract_address
            WHERE contract."contractAddress" = ${address}
        ` as any,
      prisma.$queryRaw`
            SELECT COUNT(*)
            FROM "accountBalance"
            WHERE "accountBalance".contract = ${address}
            AND "accountBalance".value > 0
        ` as any
    ])
    if (!contract[0]) {
      return null
    }

    const token = {
      ...contract[0],
      holders: accountBalanceCount[0].count
    }
    return token
  }),
  getTokenHolders: publicProcedure
    .input(
      z.object({
        address: z.string(),
        offset: z.number().min(0),
        limit: z.number().min(1).max(100).default(10)
      })
    )
    .query(async ({ input }) => {
      const address = input.address.toLowerCase()
      const contract = await prisma.contract.findUnique({
        where: {
          contractAddress: address
        }
      })
      if (!contract) {
        return null
      }

      const accountBalanceCount = await prisma.accountBalance.count({
        where: {
          contract: address,
          value: {
            gt: 0
          }
        }
      })
      const accountBalances = await prisma.accountBalance.findMany({
        select: {
          address: true,
          value: true,
          tokenId: true
        },
        where: {
          contract: address,
          value: {
            gt: 0
          }
        },
        orderBy: {
          value: 'desc'
        },
        skip: input.offset,
        take: input.limit
      })

      let balances = []
      for (const balance of accountBalances) {
        const balanceObj = {
          address: balance.address,
          value: '0',
          tokenId: balance.tokenId,
          percentage: '0'
        }
        if (Number(contract.totalSupply) == 0) {
          balanceObj.percentage = '0'
          balanceObj.value = balance.value ? balance.value.toString() : '0'
        } else {
          balanceObj.percentage = ((Number(balance.value) / contract.totalSupply.toNumber()) * 100).toString()
          balanceObj.value = balance.value ? (balance.value.toNumber() / 10 ** Number(contract.decimals)).toString() : '0'
        }
        balances.push(balanceObj)
      }

      return {
        count: accountBalanceCount,
        list: balances
      }
    }),
  getTokenList: publicProcedure
    .input(
      z.object({
        offset: z.number().min(0),
        limit: z.number().min(1).max(100).default(10),
        tokenType: z.number().min(1).max(3).default(1)
      })
    )
    .query(async ({ input }) => {
      const tokensCountPromise = prisma.$queryRaw`
            SELECT COUNT(*) FROM "token_list_materialized" WHERE "contractType" = ${input.tokenType}
      `
      // if erc20, return erc20 list order by holders
      if (input.tokenType == 1) {
        const tokensPromise = prisma.$queryRaw`
            SELECT * FROM "token_list_materialized"
            WHERE "contractType" = ${input.tokenType}
            ORDER BY "holders" DESC
            OFFSET ${input.offset}
            LIMIT ${input.limit}
        `
        const [tokensCount, tokens] = await Promise.all([tokensCountPromise, tokensPromise])
        const count = tokensCount as any[]
        return {
          count: count[0].count,
          list: tokens
        }
      }
      // if erc721/erc1155, return erc721/erc1155 list order by trans24h
      if (input.tokenType == 2 || input.tokenType == 3) {
        const tokensPromise = prisma.$queryRaw`
            SELECT * FROM "token_list_materialized"
            WHERE "contractType" = ${input.tokenType}
            ORDER BY "trans24h" DESC
            OFFSET ${input.offset}
            LIMIT ${input.limit}
        `
        const [tokensCount, tokens] = await Promise.all([tokensCountPromise, tokensPromise])
        const count = tokensCount as any[]
        return {
          count: count[0].count,
          list: tokens
        }
      }

      return null
    }),
  getTokenTransactionList: publicProcedure
    .input(
      z.object({
        address: z.string().optional(),
        tokenType: z.number().min(1).max(3).default(1),
        order: z.number().min(0).max(1).default(1),
        offset: z.number().min(0).default(0),
        limit: z.number().min(1).max(100).default(10)
      })
    )
    .query(async ({ input }) => {
      const address = input.address?.toLowerCase()
      const queryAddressFilter = address ? `AND "tokenTransfer".contract = '${address}'` : ''

      const transCount = (await prisma.$queryRawUnsafe(`
      SELECT COUNT(*)
      FROM "tokenTransfer"
      INNER JOIN "contract" ON "tokenTransfer".contract = "contract"."contractAddress"
      WHERE "tokenType" = ${input.tokenType}
      ${queryAddressFilter}
    `)) as any[]

      const trans = (await prisma.$queryRawUnsafe(`
            WITH filtered_data AS (
                SELECT *
                FROM "tokenTransfer"
                WHERE "tokenType" = ${input.tokenType}
                ${queryAddressFilter}
                ORDER BY "blockTime" DESC
                OFFSET ${input.offset}
                LIMIT ${input.limit}
            )
            SELECT filtered_data.*, "contract".name, "contract".symbol, "contract".decimals, "tokenListMaintain".logo_path
            FROM filtered_data
            LEFT OUTER JOIN "tokenListMaintain" ON filtered_data.contract = "tokenListMaintain".contract_address
            INNER JOIN "contract" ON filtered_data.contract = "contract"."contractAddress"
        `)) as any[]

      let tokenTransfers = []
      for (const tran of trans) {
        tokenTransfers.push(tran)
      }
      return {
        count: transCount ? transCount[0].count : 0,
        list: tokenTransfers
      }
    })
})
