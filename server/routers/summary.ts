import prisma from '../prisma'
import redis from '../redis'
import { publicProcedure, router } from '../trpc'

const RedisSummaryAvgTPS24hKey = 'scroll-summary-avg-tps-24h'
const RedisSummaryAvgPrice24Key = 'scroll-summary-avg-price-24h'

export const summaryRouter = router({
  getAvgTps24h: publicProcedure.query(async () => {
    const v = await redis.get(RedisSummaryAvgTPS24hKey)
    if (v !== null) {
      return v
    } else {
      const txCount = await prisma.transaction.count({
        where: {
          blockTime: {
            gt: Math.floor(Date.now() / 1000) - 86400
          }
        }
      })
      const tps = txCount / 86400
      return tps.toString()
    }
  }),

  getAvgPrice24h: publicProcedure.query(async () => {
    const v = await redis.get(RedisSummaryAvgPrice24Key)
    if (v !== null) {
      return v
    } else {
      const aggregations = await prisma.transaction.aggregate({
        _sum: {
          gasPrice: true
        },
        _count: true,
        where: {
          blockTime: {
            gt: Math.floor(Date.now() / 1000) - 86400
          }
        }
      })
      let price = 0.0
      const gasPrice = aggregations._sum.gasPrice
      const txCount = aggregations._count
      if (gasPrice !== null && txCount !== 0) {
        price = Number(gasPrice) / txCount
        price = parseFloat((price / 1000000000).toFixed(2))
      }
      return price.toString()
    }
  })
})
