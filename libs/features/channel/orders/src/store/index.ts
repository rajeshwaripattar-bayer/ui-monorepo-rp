import { useDispatch } from 'react-redux'

import { buildStore, mergeWithGlobalReducers } from '@gc/redux-store'

const rootReducer = mergeWithGlobalReducers({})

export const setUpStore = (preloadedState?: RootState) =>
  buildStore(
    { preloadedState, reducer: rootReducer },
    {
      injectOrdersApi: true,
      injectConfigDataApi: true,
      useGlobalMiddleware: true,
      middlewareOpts: { serializableCheck: false }
    }
  )

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setUpStore>
export type AppDispatch = AppStore['dispatch']

export const store = setUpStore()
export const useAppDispatch: () => AppDispatch = useDispatch // Export a hook that can be reused to resolve types
