import {
  cartToQuoteMutation,
  duplicateQuoteMutation,
  getAllQuotesQuery,
  getQuoteDetailsQuery,
  quotePDFMutation,
  updateQuote
} from '@gc/rtk-queries'
import { CCApiSlice, ExtendedCCApiSlice, QueryArg, ResultType } from '@gc/types'
import useMutationWithRetry from '../utils/useMutationWithRetry'

type ExtendedApiSlice = ExtendedCCApiSlice<{
  getAllQuotes: ReturnType<typeof getAllQuotesQuery>
  getQuoteDetails: ReturnType<typeof getQuoteDetailsQuery>
  updateQuote: ReturnType<typeof updateQuote>
  convertCartToQuote: ReturnType<typeof cartToQuoteMutation>
  duplicateQuote: ReturnType<typeof duplicateQuoteMutation>
  quotePDF: ReturnType<typeof quotePDFMutation>
}>

let extendedApiSlice: ExtendedApiSlice
export const injectQuotesEndpoints = (apiSlice: CCApiSlice) => {
  extendedApiSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getAllQuotes: getAllQuotesQuery(builder),
      getQuoteDetails: getQuoteDetailsQuery(builder),
      updateQuote: updateQuote(builder, () => extendedApiSlice),
      convertCartToQuote: cartToQuoteMutation(builder, () => extendedApiSlice),
      duplicateQuote: duplicateQuoteMutation(builder),
      quotePDF: quotePDFMutation(builder)
    })
  })
}

type Endpoints = ExtendedApiSlice['endpoints']
type Q<T extends keyof Endpoints> = QueryArg<Endpoints, T>
type R<T extends keyof Endpoints> = ResultType<Endpoints, T>

export const useQuotesQueries = () => {
  if (extendedApiSlice) {
    const { useDuplicateQuoteMutation, useUpdateQuoteMutation } = extendedApiSlice
    return {
      ...extendedApiSlice,
      useDuplicateQuoteMutation: useMutationWithRetry<Q<'duplicateQuote'>, R<'duplicateQuote'>>(
        useDuplicateQuoteMutation
      ),
      useUpdateQuoteMutation: useMutationWithRetry<Q<'updateQuote'>, R<'updateQuote'>>(useUpdateQuoteMutation)
    }
  } else {
    throw new Error('Make sure injectQuotesEndpoints was called in store.')
  }
}
