import _ from 'lodash'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import {
  BillToParty,
  Cart,
  DiscountEntry,
  BayerDiscountEntriesPostPayload,
  BayerDiscountEntriesPutPayload,
  BrandDiscountEntry,
  BayerEntriesResponse,
  BayerEntryResponse
} from '@gc/types'
import { getUserPrefix } from '@gc/utils'

const urlPrefix = () => `${getUserPrefix()}/carts`

export const getCurrentCartQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.query<Cart, string | void>({
    query: (cartId?: string) => ({ url: `${urlPrefix()}/${cartId ? cartId : 'current'}?fields=ONEDCE_CBUS` }),
    providesTags: (result, error, cartId) => {
      if (cartId) {
        return [{ type: 'Cart', id: cartId }]
      } else {
        return ['Cart']
      }
    },
    keepUnusedDataFor: 0
  })
}

export const updateCurrentAttributesMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<
    void,
    {
      cartId: string
      attributes: {
        name?: string
        expirationDate?: string
        distributionChannel?: string
        division?: string
        documentType?: string
        grower?: string
        salesOrg?: string
        agentSapId?: string
        salesYear?: string
        stateCode?: string
        county?: string
        salesOffice?: string
        salesGroup?: string
        salesDistrict?: string
        billToParties?: BillToParty[]
        cartType?: string
        orderEntries?: {
          product: {
            code: string
          }
          quantity: string | number
          storageLocationCode: string
        }[]
      }
    }
  >({
    query: ({ cartId, attributes }) => ({
      url: `${urlPrefix()}/${cartId}?fields=ONEDCE_CBUS`,
      method: 'PUT',
      data: attributes
    }),
    invalidatesTags: (result, error, arg) => (error ? [] : ['Cart', { type: 'Cart', id: arg.cartId }])
  })
}

export const updateCartEntriesMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<
    BayerEntriesResponse,
    {
      cartId: string
      data: {
        orderEntries: {
          product: {
            code: string
          }
          quantity?: number
          storageLocationCode?: string
          entryNumber?: number
        }[]
      }
      updateMethod?: 'PUT' | 'POST'
      skipCartRefetch?: boolean
    }
  >({
    query: ({ cartId, data, updateMethod }) => ({
      url: `${urlPrefix()}/${cartId}/bayer-entries?fields=ONEDCE_CBUS`,
      method: updateMethod || 'POST',
      data: { orderEntries: data.orderEntries.filter((e) => typeof e.quantity !== 'undefined') }
    }),
    invalidatesTags: (result, error, { cartId, skipCartRefetch }) =>
      skipCartRefetch ? [] : ['Cart', { type: 'Cart', id: cartId }]
  })
}

export const deleteCartMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<void, string>({
    query: (cartId) => ({
      url: `${urlPrefix()}/${cartId}`,
      method: 'DELETE'
    }),
    invalidatesTags: (result, error, cartId) => ['Cart', { type: 'Cart', id: cartId }]
  })
}

export const deleteCartEntryMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<
    void,
    {
      cartId: string
      entryNumber: number
      skipCartRefetch?: boolean
    }
  >({
    query: ({ cartId, entryNumber }) => ({
      url: `${urlPrefix()}/${cartId}/entries/${entryNumber}`,
      method: 'DELETE'
    }),
    invalidatesTags: (result, error, { cartId, skipCartRefetch }) =>
      skipCartRefetch ? [] : ['Cart', { type: 'Cart', id: cartId }]
  })
}

export const updateCartEntryMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<
    BayerEntryResponse,
    {
      cartId: string
      data: {
        product: {
          code: string
        }
        quantity?: number | undefined
        storageLocationCode?: string
        entryNumber?: number
      }
      skipCartRefetch?: boolean
    }
  >({
    query: ({ cartId, data }) => {
      if (!_.isNumber(data.entryNumber)) {
        console.error('Entry number not found!!', { cartId, data })
      } else {
        return {
          url: `${urlPrefix()}/${cartId}/entries/${data.entryNumber}?fields=ONEDCE_CBUS`,
          method: 'PUT',
          data
        }
      }
    },
    invalidatesTags: (result, error, { cartId, skipCartRefetch }) =>
      skipCartRefetch ? [] : ['Cart', { type: 'Cart', id: cartId }]
  })
}

export const addDiscretionaryDiscountsMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<
    void,
    {
      cartId: string
      entryNumber: number
      discounts: DiscountEntry[]
    }
  >({
    query: ({ cartId, discounts, entryNumber }) => ({
      url: `${urlPrefix()}/${cartId}/entries/${entryNumber}/discretionary-discount?fields=ONEDCE_CBUS`,
      method: 'POST',
      data: { discretionaryDiscountEntries: discounts }
    }),
    invalidatesTags: (result, error, { cartId }) => [{ type: 'Cart', id: cartId }]
  })
}

export const updateDiscretionaryDiscountsMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<
    void,
    {
      cartId: string
      entryNumber: number
      discounts: (DiscountEntry & { itemNumber: string })[]
    }
  >({
    query: ({ cartId, discounts, entryNumber }) => ({
      url: `${urlPrefix()}/${cartId}/entries/${entryNumber}/discretionary-discount?fields=ONEDCE_CBUS`,
      method: 'PUT',
      data: { discretionaryDiscountEntries: discounts }
    }),
    invalidatesTags: (result, error, { cartId }) => [{ type: 'Cart', id: cartId }]
  })
}

export const deleteDiscretionaryDiscountsMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<
    void,
    {
      cartId: string
      entryNumber: number
      itemNumbers: string[]
    }
  >({
    query: ({ cartId, itemNumbers, entryNumber }) => ({
      url: `${urlPrefix()}/${cartId}/entries/${entryNumber}/discretionary-discount?fields=ONEDCE_CBUS`,
      method: 'DELETE',
      data: {
        discretionaryDiscountEntries: itemNumbers.map((itemNumber: string) => ({ itemNumber }))
      }
    }),
    invalidatesTags: (result, error, { cartId }) => [{ type: 'Cart', id: cartId }]
  })
}

export const addDiscretionaryDiscountsMultiEntryMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<
    void,
    {
      cartId: string
      bayerDiscountEntries: BayerDiscountEntriesPostPayload[]
    }
  >({
    query: ({ cartId, bayerDiscountEntries }) => ({
      url: `${urlPrefix()}/${cartId}/entries/discounts?fields=ONEDCE_CBUS`,
      method: 'POST',
      data: { bayerDiscountEntries }
    }),
    invalidatesTags: (result, error, { cartId }) => (error ? [] : [{ type: 'Cart', id: cartId }])
  })
}

export const updateDiscretionaryDiscountsMultiEntryMutation = (
  builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>
) => {
  return builder.mutation<
    void,
    {
      cartId: string
      bayerDiscountEntries: BayerDiscountEntriesPutPayload[]
    }
  >({
    query: ({ cartId, bayerDiscountEntries }) => ({
      url: `${urlPrefix()}/${cartId}/entries/discounts?fields=ONEDCE_CBUS`,
      method: 'PUT',
      data: { bayerDiscountEntries }
    }),
    invalidatesTags: (result, error, { cartId }) => (error ? [] : [{ type: 'Cart', id: cartId }])
  })
}

export const deleteDiscretionaryDiscountsMultiEntryMutation = (
  builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>
) => {
  return builder.mutation<
    void,
    {
      cartId: string
      bayerDiscountEntries: { entryNumber: string; discounts: { itemNumber: string }[] }[]
    }
  >({
    query: ({ cartId, bayerDiscountEntries }) => ({
      url: `${urlPrefix()}/${cartId}/entries/discounts?fields=ONEDCE_CBUS`,
      method: 'DELETE',
      data: { bayerDiscountEntries }
    }),
    invalidatesTags: (result, error, { cartId }) => (error ? [] : [{ type: 'Cart', id: cartId }])
  })
}

export const addBrandDiscountsMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<
    void,
    {
      cartId: string
      discounts: BrandDiscountEntry[]
    }
  >({
    query: ({ cartId, discounts }) => ({
      url: `${urlPrefix()}/${cartId}/brand-discounts?fields=ONEDCE_CBUS`,
      method: 'POST',
      data: { programs: discounts }
    }),
    invalidatesTags: (result, error, { cartId }) => (error ? [] : ['Cart', { type: 'Cart', id: cartId }])
  })
}

export const updateBrandDiscountsMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<
    void,
    {
      cartId: string
      discounts: BrandDiscountEntry[]
    }
  >({
    query: ({ cartId, discounts }) => ({
      url: `${urlPrefix()}/${cartId}/brand-discounts?fields=ONEDCE_CBUS`,
      method: 'PUT',
      data: { programs: discounts }
    }),
    invalidatesTags: (result, error, { cartId }) => (error ? [] : ['Cart', { type: 'Cart', id: cartId }])
  })
}

export const deleteBrandDiscountsMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<
    void,
    {
      cartId: string
      discounts: BrandDiscountEntry[]
    }
  >({
    query: ({ cartId, discounts }) => ({
      url: `${urlPrefix()}/${cartId}/brand-discounts?fields=ONEDCE_CBUS`,
      method: 'DELETE',
      data: { programs: discounts }
    }),
    invalidatesTags: (result, error, { cartId }) => (error ? [] : ['Cart', { type: 'Cart', id: cartId }])
  })
}
