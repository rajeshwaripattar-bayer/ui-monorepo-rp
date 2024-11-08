import {
  addToFavoritesMutation,
  getFavoritesQuery,
  getProductsQuery,
  removeFromFavoritesMutation
} from '@gc/rtk-queries'
import { ccApi } from '@gc/redux-store'

export const extendedApiSlice = ccApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProductList: getProductsQuery(builder),
    getFavoriteProducts: getFavoritesQuery(builder),
    addToFavorites: addToFavoritesMutation(builder),
    removeFromFavorites: removeFromFavoritesMutation(builder)
  })
})

export const {
  useGetProductListQuery,
  useGetFavoriteProductsQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation
} = extendedApiSlice
