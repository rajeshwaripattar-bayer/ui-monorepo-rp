import _, { range } from 'lodash'
import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { FavoriteProductsResponse, ProductSearchResponse } from '@gc/types'
import { getParams } from '@gc/utils'
import { COMMERCE_CLOUD_API } from '@gc/shared/env'
import { getUserPrefix, getUserName } from '@gc/utils'
import { getAzureClient } from '@gc/api/client'
import { ccFieldsChannel } from '@gc/constants'

const getParamsStr = (paramsObj: object = {}, isMobile: boolean = false): string =>
  getParams(paramsObj, { isMobile, fields: ccFieldsChannel })
const productsUrlPrefix = () => `/products`
const favoritesUrlPrefix = () => `${getUserPrefix()}/favourites/entries`

export const getProductsQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.query<
    ProductSearchResponse,
    {
      pageSize?: number
      userId?: string
      query: {
        searchTerm?: string
        sort?: string
        filters?: { [key: string]: string }
        cartId?: string
      }
    } | void
  >({
    queryFn: async (payload) => {
      const {
        pageSize = 500,
        query: { searchTerm = '', sort = '', filters = {}, cartId = '' }
      } = payload || { query: {} }

      const baseUrl = `${COMMERCE_CLOUD_API}/cbus${productsUrlPrefix()}/search`
      const filterKey = _.map(Object.keys(filters), (key) => `${key}:${filters[key]}`).join(':')

      function fetchProducts(currentPage: number = 0) {
        const azureClient = getAzureClient()
        const query = `${searchTerm}:${sort}:${filterKey}&cartId=${cartId}`
        const url = `${baseUrl}${getParamsStr({ query, pageSize, currentPage, userId: getUserName() })}`
        return azureClient.get<ProductSearchResponse>(url)
      }

      try {
        const { data } = await fetchProducts()
        let products = _.concat(
          [],
          _.filter(data.products, (p) => !!p)
        )

        const { totalPages, currentPage } = data.pagination
        if (totalPages - 1 > currentPage) {
          const pageRange = range(currentPage + 1, totalPages)

          // Generate an array of promises based on the remaining pages and run the api calls
          // in parallel
          const totalResults = await Promise.allSettled(_.map(pageRange, (page) => fetchProducts(page)))

          // Loop over results, combining products and filtering undefined values
          _.forEach(totalResults, (productResult) => {
            if (productResult.status === 'fulfilled') {
              const filteredProducts = _.filter(productResult.value.data.products, (p) => !!p)
              products = _.concat(products, filteredProducts)
            }
          })
        }

        return { data: { ...data, products } }
      } catch (error) {
        return { error }
      }
    },
    providesTags: (result) =>
      result
        ? [
            // Provides a tag for each post in the current page,
            // as well as the 'PARTIAL-LIST' tag.
            ...result.products.map(({ code }) => ({ type: 'Products' as const, id: code })),
            { type: 'Products', id: 'PARTIAL-LIST' }
          ]
        : [{ type: 'Products', id: 'PARTIAL-LIST' }]
  })
}

export const getFavoritesQuery = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.query<FavoriteProductsResponse, void>({
    query: () => ({
      url: `${favoritesUrlPrefix()}?fields=ONEDCE_CBUS`,
      method: 'GET'
    }),
    providesTags: ['Favorites']
  })
}

export const addToFavoritesMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<void, string>({
    query: (productCode) => ({
      url: `${favoritesUrlPrefix()}/${productCode}?fields=ONEDCE_CBUS`,
      method: 'POST'
    })
  })
}

export const removeFromFavoritesMutation = (builder: EndpointBuilder<BaseQueryFn, string, 'ccApi'>) => {
  return builder.mutation<void, string>({
    query: (productCode) => ({
      url: `${favoritesUrlPrefix()}/${productCode}?fields=ONEDCE_CBUS`,
      method: 'DELETE'
    })
  })
}
