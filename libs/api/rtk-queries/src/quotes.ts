import _, { noop } from 'lodash'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { getParams, getUserPrefix, range } from '@gc/utils'
import { QuoteDetails, Quote, Quotes, Cart } from '@gc/types'
import { getAzureClient } from '@gc/api/client'
import { GC_MIDDLEWARE_API, COMMERCE_CLOUD_API } from '@gc/shared/env'
import { ccFieldsChannel } from '@gc/constants'

const quoteListFields = {
  MOBILE: 'ONEDCE_CBUS_MOBILE_MIN',
  DESKTOP: 'ONEDCE_CBUS_DESKTOP_MIN'
}

const getParamsStr = (paramsObj: object = {}, isMobile = false, fields: { MOBILE: string; DESKTOP: string }): string =>
  getParams(paramsObj, { isMobile, fields })
const urlPrefix = () => `${getUserPrefix()}/quotes`

export const getAllQuotesQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.query<
    Quote[],
    {
      reqBody?: {
        salesYear?: string[]
        soldToAccounts?: string[]
        statuses?: string[]
        agentSAPAccounts: string[]
      }
      params?: { currentPage?: number; fields?: string; pageSize?: number; lang?: string }
      isMobile?: boolean
      updatePartialQuotes?: (a: Quote[]) => void
    } | void
  >({
    queryFn: async (payload) => {
      function fetchQuotes(currentPage = 0) {
        const azureClient = getAzureClient()
        const url = `${COMMERCE_CLOUD_API}/cbus${urlPrefix()}/bayer-quotes${getParamsStr(
          { ...payload?.params, currentPage },
          payload?.isMobile,
          quoteListFields
        )}`
        return azureClient.post<Quotes>(url, payload?.reqBody || {})
      }

      try {
        const { data } = await fetchQuotes()
        if (payload?.updatePartialQuotes) {
          payload.updatePartialQuotes(data.quotes)
        }
        let quotes = _.concat([], data.quotes ?? [])

        const { totalPages, currentPage } = data.pagination
        if (totalPages - 1 > currentPage) {
          const pageRange = range(currentPage + 1, totalPages)

          // Generate an array of promises based on the remaining pages and run the api calls
          // in parallel
          const totalResults = await Promise.allSettled(_.map(pageRange, (page) => fetchQuotes(page)))

          // Loop over results, combining products and filtering undefined values
          _.forEach(totalResults, (quotesResults) => {
            if (quotesResults.status === 'fulfilled') {
              quotes = _.concat(quotes, quotesResults.value.data.quotes)
            } else {
              throw new Error(quotesResults.reason)
            }
          })
        }

        return { data: quotes }
      } catch (error) {
        return { error }
      }
    },
    keepUnusedDataFor: 3600,
    serializeQueryArgs: ({ queryArgs }) => `quotes${JSON.stringify(_.get(queryArgs, 'reqBody', {}))}`,
    providesTags: (quotes) =>
      quotes
        ? [
            // Provides a tag for each post in the current page,
            // as well as the 'PARTIAL-LIST' tag.
            ...quotes.map(({ code }) => ({ type: 'Quote' as const, id: code })),
            { type: 'Quote', id: 'PARTIAL-LIST' }
          ]
        : [{ type: 'Quote', id: 'PARTIAL-LIST' }]
  })
}

export const getQuoteDetailsQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.query<
    QuoteDetails,
    {
      quoteId: string
      isMobile?: boolean
    }
  >({
    query: (payload) => ({
      url: `${urlPrefix()}/${payload.quoteId}` + getParamsStr({}, payload?.isMobile, ccFieldsChannel)
    }),
    // TODO This changes is required for June 18th DEMO - Once CC is returning discretionaryDiscounts as expected we can remove this transform
    transformResponse: (response: QuoteDetails) => {
      const modifiedQuoteDetails = _.cloneDeep(response)
      modifiedQuoteDetails?.entries?.forEach((e) => {
        if (e.bayerDiscounts && e.bayerDiscounts.length) {
          e.discretionaryDiscounts = [...e.bayerDiscounts]
        }
      })
      return modifiedQuoteDetails
    },
    providesTags: (_result, _error, arg) => [{ type: 'Quote', id: arg.quoteId }]
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateQuote = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>, getApi: () => any) => {
  return builder.mutation<
    Quote | Cart,
    {
      quoteId: string
      reqBody?: {
        action: string
      }
      params?: { fields?: string; lang?: string }
      isMobile?: boolean
    }
  >({
    query: (payload) => ({
      url:
        `${urlPrefix()}/${payload?.quoteId}/action` + getParamsStr(payload?.params, payload?.isMobile, ccFieldsChannel),
      method: 'POST',
      data: payload?.reqBody || {}
    }),
    async onQueryStarted({ quoteId, reqBody = {} }, { dispatch, queryFulfilled, getState }) {
      const api = getApi()

      const patchedResults = [
        dispatch(
          api.util.updateQueryData('getQuoteDetails', quoteId, (draft: QuoteDetails) => Object.assign(draft, reqBody))
        )
      ]

      if (reqBody?.action === 'CANCEL') {
        for (const [, info] of Object.entries(getState().ccApi.queries || {})) {
          if (info?.endpointName === 'getAllQuotes') {
            const quotes = info?.data as Quote[]
            const matchingQuote = quotes?.find((q) => q.code === quoteId)
            if (matchingQuote) {
              patchedResults.push(
                dispatch(
                  api.util.updateQueryData('getAllQuotes', info.originalArgs, () => {
                    return quotes.filter((q) => q.code !== quoteId)
                  })
                )
              )
            }
          }
        }
      }

      queryFulfilled.catch(() => _.forEach(patchedResults, (patchResult) => patchResult.undo()))
    },
    invalidatesTags: (_result, _error, arg) => {
      if (arg.reqBody?.action === 'SUBMIT' && !_error) {
        return ['Quote', { type: 'Quote', id: arg.quoteId }]
      } else {
        return []
      }
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cartToQuoteMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>, getApi: () => any) => {
  return builder.mutation<
    Quote,
    {
      cartId: string
      skipQuotesRefetch?: boolean
    }
  >({
    query: ({ cartId }) => ({
      url: `${urlPrefix()}?fields=ONEDCE_CBUS`,
      method: 'POST',
      data: { cartId }
    }),
    async onQueryStarted({ skipQuotesRefetch = {} }, { dispatch, queryFulfilled, getState }) {
      const api = getApi()
      queryFulfilled
        .then((res) => {
          // Update the quotes list with the new quote when skipQuotesRefetch is true
          if (skipQuotesRefetch) {
            for (const [, info] of Object.entries(getState().ccApi.queries || {})) {
              if (info?.endpointName === 'getAllQuotes') {
                const quotes = _.cloneDeep(info.data) as Quote[]
                quotes.unshift(res.data as Quote)
                dispatch(api.util.updateQueryData('getAllQuotes', info.originalArgs, () => quotes))
              }
            }
          }
        })
        .catch(noop)
    },
    invalidatesTags: (_result, _error, arg) => (arg.skipQuotesRefetch ? [] : ['Quote'])
  })
}
export const duplicateQuoteMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<Quote, string>({
    query: (quoteCode) => ({
      url: `${urlPrefix()}?fields=ONEDCE_CBUS`,
      method: 'POST',
      data: { quoteCode }
    })
  })
}

export const quotePDFMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<Quote, string>({
    query: (quoteCode) => ({
      url: `${GC_MIDDLEWARE_API}/agency/quote-pdf/${quoteCode}`,
      method: 'GET',
      data: { quoteCode }
    })
  })
}
