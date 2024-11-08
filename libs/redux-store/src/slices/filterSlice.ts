import { Facet, Filter } from '@gc/types'
import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import { GlobalAppDispatch, GlobalRootState } from '../types/index'
export type FiltersState = {
  products: {
    searchTerm: string
    crop: string
    filters: Filter[]
    sortBy: string
  }
}

const initialState: FiltersState = {
  products: {
    searchTerm: '',
    crop: '',
    filters: [],
    sortBy: ''
  }
}

const _clearProductFilters = (state: FiltersState) => {
  state.products.filters = []
}

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setProductSearchTerm: (state, action) => {
      state.products.searchTerm = action.payload
    },
    setSelectedProductCrop: (state, action) => {
      if (state.products.crop !== action.payload) {
        _clearProductFilters(state)
        state.products.filters = state.products.filters.map((f) => ({ ...f, selectedOptions: [] }))
      }
      state.products.crop = action.payload
    },
    setProductFilters: (state, action) => {
      state.products.filters = action.payload
    },
    clearProductFilters: (state) => {
      _clearProductFilters(state)
    },
    setProductSortBy: (state, action) => {
      state.products.sortBy = action.payload
    }
  }
})

export const setProductFilterOptions =
  (_facets: Facet[], defaultFilters: Filter[] = []) =>
  (dispatch: GlobalAppDispatch, getState: () => GlobalRootState) => {
    const state = getState()
    // This condition prevents filters to reset as SAP CC returns facets based on selected filters.
    if (state.filters.products.filters.every((f) => f.selectedOptions.length === 0)) {
      const facets = _facets.filter((f) => !f.code.startsWith('acronym')) // Remove acronym filter as SAP CC team must keep it for other countries!
      const filtersWithOptions: Filter[] = [
        ...defaultFilters,
        ...facets.map((f) => ({
          category: f.code,
          title: f.name,
          options: f.values.map((v) => v.facetValue),
          selectedOptions: []
        }))
      ]
      if (!_.isEqual(state.filters.products.filters, filtersWithOptions)) {
        dispatch(filtersSlice.actions.setProductFilters(filtersWithOptions))
      }
    }
  }

export const {
  setProductSearchTerm,
  setSelectedProductCrop,
  setProductFilters,
  clearProductFilters,
  setProductSortBy
} = filtersSlice.actions
