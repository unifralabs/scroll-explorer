import { publicProcedure, router } from '../trpc'
import { addressRouter } from './address'
import { batchRouter } from './batch'
import { blockRouter } from './block'
import { contractRouter } from './contract'
import { statRouter } from './stat'
import { summaryRouter } from './summary'
import { tokenRouter } from './token'
import { transactionRouter } from './transaction'
import { utilRouter } from './util'

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  block: blockRouter,
  transaction: transactionRouter,
  batch: batchRouter,
  token: tokenRouter,
  address: addressRouter,
  contract: contractRouter,
  util: utilRouter,
  summary: summaryRouter,
  stat: statRouter
})

// export type definition of API
export type AppRouter = typeof appRouter
