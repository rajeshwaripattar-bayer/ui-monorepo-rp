import type { ExtractReducerState, EnhancedStore } from '@gc/types'
import { ccApi, middlewareApi, fgCcApi } from '../rtk-apis'
import type { AppState, CartState, FiltersState } from '../slices'

export type GlobalRootState = {
  app: AppState
  cart: CartState
  filters: FiltersState
  [ccApi.reducerPath]: ExtractReducerState<typeof ccApi.reducer>
  [fgCcApi.reducerPath]: ExtractReducerState<typeof fgCcApi.reducer>
  [middlewareApi.reducerPath]: ExtractReducerState<typeof middlewareApi.reducer>
}

export type GlobalAppStore = EnhancedStore<GlobalRootState>
export type GlobalAppDispatch = GlobalAppStore['dispatch']
