import { ccApi, fgCcApi, middlewareApi } from '../rtk-apis'
import { appSlice, cartSlice, filtersSlice } from '../slices'

export const globalReducers = {
  app: appSlice.reducer,
  cart: cartSlice.reducer,
  filters: filtersSlice.reducer,
  [ccApi.reducerPath]: ccApi.reducer,
  [fgCcApi.reducerPath]: fgCcApi.reducer,
  [middlewareApi.reducerPath]: middlewareApi.reducer
}

export const globalMiddlewares = {
  ccApi: ccApi.middleware,
  fgCcApi: fgCcApi.middleware,
  middlewareApi: middlewareApi.middleware
}

export function getGlobalStoreOptions() {
  return { globalReducers, globalMiddlewares }
}
