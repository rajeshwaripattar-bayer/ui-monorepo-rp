/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { DiscretionaryBudget, DiscretionaryBudgetRequest, RecommendedRange, RecommendedRangeRequest } from '@gc/types'
import { COMMERCE_CLOUD_API } from '@gc/shared/env'
import { Discount, Strategy } from '@gc/types'
import { PREPAY } from '@gc/constants'

export const getDiscretionaryBudgetsQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'middlewareApi'>) => {
  return builder.query<DiscretionaryBudget[], DiscretionaryBudgetRequest>({
    query: (request: DiscretionaryBudgetRequest) => ({
      url: `/agency/discretionary-budgets`,
      method: 'POST',
      data: request
    }),
    transformResponse: (response: DiscretionaryBudget[]) => {
      return transformDiscretionaryBudget(response)
    }
  })
}

export const getBrandDiscountsQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'middlewareApi'>) => {
  return builder.query<Discount, void>({
    query: () => ({
      url: `${COMMERCE_CLOUD_API}/cbus/bayer-program?type=BRAND_DISCOUNT&fields=DEFAULT&year=2025`
    }),
    transformResponse: (response: Discount) => {
      return transformBrandDiscounts(response)
    },
    keepUnusedDataFor: 3600
  })
}

const transformDiscretionaryBudget = (results: any) => {
  return results.map((item: any) => {
    return {
      remainingBudget: item.RemainingdBudget,
      programName: item.ProgramName,
      programId: item.ProgramID,
      programExtId: item.Prg_ExtId,
      crop: item.Crop,
      allocatedBudget: item.AllocatedBudget,
      discountBuckets: item.lstST
        ? item.lstST.map((bucket: any) => {
            return {
              strategy: bucket.Strategy,
              tactics: bucket.Tactics
            }
          })
        : []
    }
  })
}

const transformBrandDiscounts = (results: any) => {
  const { programs } = results
  const brandDiscount: Discount = {
    programName: 'Brand Discount',
    strategies: []
  }
  if (programs.length) {
    const strategies: Strategy[] = []
    programs
      .filter((prgm: any) => prgm.programName !== PREPAY)
      .map((nonPrepayPrograms: any) => {
        if (nonPrepayPrograms.bayerTiers && nonPrepayPrograms.bayerTiers.length) {
          const bayerTier = nonPrepayPrograms.bayerTiers[0]
          if (
            !strategies.find((existingStrategy: Strategy) => existingStrategy.name === nonPrepayPrograms.programName)
          ) {
            strategies.push({
              name: nonPrepayPrograms.programName,
              displayDiscount: bayerTier.discount,
              discountValue: bayerTier.discount,
              discountPercentage: bayerTier.discount,
              discountUnit: bayerTier.type,
              discountDescription: `${bayerTier.discount}% off retail price`,
              strategyId: nonPrepayPrograms.programId,
              programName: nonPrepayPrograms.programName,
              bayerTierId: bayerTier.bayerTierId
            })
          }
        }
        return true
      })

    programs
      .filter((prgm: any) => prgm.programName === PREPAY)
      .map((prepayProgram: any) => {
        if (prepayProgram.bayerTiers && prepayProgram.bayerTiers.length) {
          prepayProgram.bayerTiers.sort((prev: any, next: any) => prev.sortOrder - next.sortOrder)
          prepayProgram.bayerTiers.map((bayerTier: any) =>
            strategies.push({
              name: bayerTier.paymentTypeValue,
              deadline: bayerTier.deadline,
              displayDiscount: bayerTier.discount,
              discountValue: bayerTier.discount,
              discountPercentage: bayerTier.discount,
              discountUnit: bayerTier.type,
              strategyId: prepayProgram.programId,
              programName: prepayProgram.programName,
              isPrepayDiscount: true,
              bayerTierId: bayerTier.bayerTierId
            })
          )
        }
        return true
      })
    brandDiscount.strategies = strategies
  }
  return brandDiscount
}

export const getRecommendedRangeQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'middlewareApi'>) => {
  return builder.query<RecommendedRange[], RecommendedRangeRequest>({
    query: (payload: RecommendedRangeRequest) => ({
      url: `/agency/recommended-range`,
      method: 'POST',
      data: payload
    }),
    serializeQueryArgs: () => 'recommendedRange',
    providesTags: ['RecommendedRange']
  })
}
