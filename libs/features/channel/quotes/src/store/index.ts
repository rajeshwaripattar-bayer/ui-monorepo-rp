import { useDispatch } from 'react-redux'

import { buildStore, mergeWithGlobalReducers } from '@gc/redux-store'

import quotes from './slices/quotesSlice'

const rootReducer = mergeWithGlobalReducers({
  quotes
})

export const setUpStore = (preloadedState?: Partial<RootState>) =>
  buildStore(
    { preloadedState, reducer: rootReducer },
    {
      injectQuotesApi: true,
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
