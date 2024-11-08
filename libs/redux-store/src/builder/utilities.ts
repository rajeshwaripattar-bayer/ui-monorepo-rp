import type {
  AppDispatch,
  Enhancers,
  GetDefaultMiddleware,
  GetDefaultMiddlewareOptions,
  Middlewares,
  ThunkMiddlewareFor,
  TupleEnhancers
} from '@gc/types'
import {
  combineReducers,
  configureStore,
  type Action,
  type Tuple,
  type UnknownAction,
  type ConfigureStoreOptions
} from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import { ccApi, middlewareApi, fgCcApi } from '../rtk-apis'
import { injectDeliveriesEndpoints } from '../slices'
import { injectConfigDataEndpoints } from '../slices/configDataApiSlice'
import { injectOrdersEndpoints } from '../slices/ordersApiSlice'
import { injectQuotesEndpoints } from '../slices/quotesApiSlice'
import { injectShipmentEndpoints } from '../slices/shipmentApiSlice'
import type { GlobalAppDispatch } from '../types'
import { globalReducers } from './global'

// Dispatches
export const useGlobalDispatch: () => GlobalAppDispatch = useDispatch // Export a hook that can be reused to resolve types
export const useAppDispatch: <S, E, A extends Action>() => AppDispatch<S, E, A> = useDispatch

export function mergeWithGlobalReducers<R>(reducers: R) {
  return combineReducers({ ...globalReducers, ...reducers })
}

export type BuildStoreOpts = {
  injectQuotesApi?: boolean
  injectConfigDataApi?: boolean
  injectOrdersApi?: boolean
  injectInventoryApi?:boolean
  useGlobalMiddleware?: boolean
  middlewareOpts?: GetDefaultMiddlewareOptions
}

/**
 * Builds a store with the global middleware and reducers,
 * and provides an optional way to inject the quotes API.
 *
 * @param options - The same options as `configureStore`
 * @param buildStoreOpts.injectQuotesApi - A boolean indicating whether to inject the quotes API
 * @param buildStoreOpts.useGlobalMiddleware - A boolean indicating whether to use the global middleware
 * @param buildStoreOpts.middlewareOpts - Options to pass to `getDefaultMiddleware`
 * @returns A configured store
 */
export function buildStore<
  S = unknown,
  A extends Action = UnknownAction,
  M extends Tuple<Middlewares<S>> = Tuple<[ThunkMiddlewareFor<S>]>,
  E extends Tuple<Enhancers> = TupleEnhancers<S, M>,
  P = S
>(options: ConfigureStoreOptions<S, A, M, E, P>, buildStoreOpts?: BuildStoreOpts) {
  const {
    middlewareOpts,
    injectQuotesApi = false,
    useGlobalMiddleware = true,
    injectConfigDataApi = false,
    injectOrdersApi = false,
    injectDeliveriesApi = false,
    injectInventoryApi = false
  } = { ...buildStoreOpts }

  if (injectQuotesApi) {
    injectQuotesEndpoints(ccApi)
  }
  if (injectConfigDataApi) {
    injectConfigDataEndpoints(ccApi)
  }

  if (injectOrdersApi) {
    injectOrdersEndpoints(ccApi)
  }
  if (injectDeliveriesApi) {
    injectDeliveriesEndpoints(ccApi)
  }
  if (injectInventoryApi){
    injectShipmentEndpoints(fgCcApi)
  }
  const middleware = useGlobalMiddleware
    ? (getDefaultMiddleware: GetDefaultMiddleware<S>) =>
        getDefaultMiddleware(middlewareOpts).concat(ccApi.middleware).concat(middlewareApi.middleware).concat(fgCcApi.middleware) as unknown as M
    : options.middleware

  return configureStore<S, A, M, E, P>({ ...options, middleware })
}
