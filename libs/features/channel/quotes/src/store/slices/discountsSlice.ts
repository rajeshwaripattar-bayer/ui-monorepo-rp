import { middlewareApi } from '@gc/redux-store'
import { getDiscretionaryBudgetsQuery, getRecommendedRangeQuery, getBrandDiscountsQuery } from '@gc/rtk-queries'

export const extendedApiSlice = middlewareApi.injectEndpoints({
  endpoints: (builder) => ({
    getDiscretionaryBudgets: getDiscretionaryBudgetsQuery(builder),
    getRecommendedRange: getRecommendedRangeQuery(builder),
    getBrandDiscounts: getBrandDiscountsQuery(builder)
  })
})

export const { useGetDiscretionaryBudgetsQuery, useGetBrandDiscountsQuery, useGetRecommendedRangeQuery } =
  extendedApiSlice
