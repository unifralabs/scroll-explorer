import { isHexString } from '@ethersproject/bytes'
import { z } from 'zod'

import { isPositiveInteger } from '@/utils'

import prisma from '../prisma'
import { publicProcedure, router } from '../trpc'

export const utilRouter = router({
  search: publicProcedure.input(z.string()).query(async ({ input }) => {
    const inputTrimmed = input.trim().toLowerCase()
    const inputLength = inputTrimmed.length

    // maybe block height
    if (isPositiveInteger(inputTrimmed)) {
      const blockCount = await prisma.block.count({
        where: {
          blockNumber: parseInt(inputTrimmed)
        }
      })
      if (blockCount > 0) {
        return { result: 'block' }
      }
      return { result: null }
    }

    // maybe block hash or tx hash or user address or contract address
    if (isHexString(inputTrimmed)) {
      if (inputLength === 42) {
        // maybe address-contract
        const contractCount = await prisma.contract.count({
          where: { contractAddress: inputTrimmed }
        })
        if (contractCount > 0) {
          return { result: 'address-contract' }
        }

        // maybe address-user (from transaction)
        const transactionCount = await prisma.transaction.count({
          where: { OR: [{ from: inputTrimmed }, { to: inputTrimmed }] }
        })
        if (transactionCount > 0) {
          return { result: 'address-user' }
        }

        // maybe address-user (from internal transaction)
        const internalTransactionCount = await prisma.internalTransaction.count({
          where: { to: inputTrimmed }
        })
        if (internalTransactionCount > 0) {
          return { result: 'address-user' }
        }

        // not match
        return { result: null }
      } else if (inputLength === 66) {
        // maybe block hash
        const blockCount = await prisma.block.count({
          where: { blockHash: inputTrimmed }
        })
        if (blockCount > 0) {
          return { result: 'block' }
        }

        // maybe tx hash
        const transactionCount = await prisma.transaction.count({
          where: { hash: inputTrimmed }
        })
        if (transactionCount > 0) {
          return { result: 'transaction' }
        }

        // not match
        return { result: null }
      }
    }
    return { result: null }
  }),
  getSolcVersions: publicProcedure.query(async () => {
    const conf = await prisma.config.findUnique({
      where: {
        key: 'solcVersion'
      }
    })
    if (!conf) {
      return null
    }
    return JSON.parse(conf.value as string)
  }),
  getEvmVersions: publicProcedure.query(async () => {
    const conf = await prisma.config.findUnique({
      where: {
        key: 'evmVersion'
      }
    })
    if (!conf) {
      return null
    }
    return JSON.parse(conf.value as string)
  })
})
