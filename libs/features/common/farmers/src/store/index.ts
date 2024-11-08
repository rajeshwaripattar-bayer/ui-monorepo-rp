import { getGlobalStoreOptions } from '@gc/redux-store'
import { combineReducers, configureStore, SerializableStateInvariantMiddlewareOptions } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import logger from 'redux-logger'

import acsCommonApi from './acsCommonApi'
import acsMyAccountApi from './acsMyAccountApi'
import aemApi from './aemApi'
import ccApi from './ccApi'
import climateApi from './climateApi'
import financeApi from './financeApi'
import licApi from './licApi'
import nbmApi from './nbmApi'
import seedServiceApi from './seedServiceApi'

const {
  globalReducers: { app }
} = getGlobalStoreOptions()

const rootReducer = combineReducers({
  app,
  [acsCommonApi.reducerPath]: acsCommonApi.reducer,
  [acsMyAccountApi.reducerPath]: acsMyAccountApi.reducer,
  [aemApi.reducerPath]: aemApi.reducer,
  [ccApi.reducerPath]: ccApi.reducer,
  [climateApi.reducerPath]: climateApi.reducer,
  [nbmApi.reducerPath]: nbmApi.reducer,
  [seedServiceApi.reducerPath]: seedServiceApi.reducer,
  [licApi.reducerPath]: licApi.reducer,
  [financeApi.reducerPath]: financeApi.reducer
})

const serializableCheck: SerializableStateInvariantMiddlewareOptions = {
  ignoredPaths: [/\.originalArgs$/],
  ignoredActionPaths: ['meta.arg', 'meta.baseQueryMeta']
}

export const setupStore = (preloadedState?: object) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware({ serializableCheck })
        .concat(acsCommonApi.middleware)
        .concat(acsMyAccountApi.middleware)
        .concat(aemApi.middleware)
        .concat(ccApi.middleware)
        .concat(climateApi.middleware)
        .concat(nbmApi.middleware)
        .concat(seedServiceApi.middleware)
        .concat(licApi.middleware)
        .concat(financeApi.middleware)
      if (process.env.NODE_ENV !== 'production') {
        middleware.concat(logger)
      }
      return middleware
    },
    preloadedState,
    devTools: process.env.NODE_ENV !== 'production'
  })
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
export const useAppDispatch: () => AppDispatch = useDispatch

export * from './acsCommonApi'
export * from './acsMyAccountApi'
export * from './aemApi'
export * from './ccApi'
export * from './climateApi'
export * from './financeApi'
export * from './licApi'
export * from './nbmApi'
export * from './seedServiceApi'
