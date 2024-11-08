import { GlobalRootState } from '../types'

export const getProductSearchTerm = (state: GlobalRootState) => state.filters.products.searchTerm
export const getProductSelectedCrop = (state: GlobalRootState) => state.filters.products.crop
export const getProductFilters = (state: GlobalRootState) => state.filters.products.filters
export const getProductSortBy = (state: GlobalRootState) => state.filters.products.sortBy
