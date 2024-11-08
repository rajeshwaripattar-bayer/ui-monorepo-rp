import type {
  Action,
  ConfigureStoreOptions,
  Middleware,
  Reducer,
  EnhancedStore as ReduxEnhancedStore,
  StoreEnhancer,
  TSHelpersExtractDispatchExtensions,
  ThunkDispatch,
  Tuple,
  UnknownAction
} from '@reduxjs/toolkit'

// =============
// STATE
// =============

export type ExtractReducerState<P> = P extends Reducer<infer G> ? G : never

// =============
// STORE
// =============

export type EnhancedStore<S = unknown, A extends Action = UnknownAction> = ReduxEnhancedStore<
  S,
  A,
  Tuple<[StoreEnhancer<{ dispatch: ThunkDispatch<S, undefined, UnknownAction> }>, StoreEnhancer]>
>

// =============
// MIDDLEWARE
// =============

export type Middlewares<S> = ReadonlyArray<Middleware<NonNullable<unknown>, S>>
export type GetDefaultMiddleware<S = unknown> = Parameters<NonNullable<ConfigureStoreOptions<S>['middleware']>>[0]
export type GetDefaultMiddlewareOptions = NonNullable<Parameters<GetDefaultMiddleware>[0]>
export type ThunkMiddlewareFor<S> = ReturnType<GetDefaultMiddleware<S>>[0]

// =============
// ENHANCERS
// =============

export type Enhancers = ReadonlyArray<StoreEnhancer>

export type TupleEnhancers<S, M extends Tuple<Middlewares<S>>> = Tuple<
  [StoreEnhancer<{ dispatch: TSHelpersExtractDispatchExtensions<M> }>, StoreEnhancer]
>

// =============
// DISPATCH
// =============

export type UnknownDispatch<State = unknown, ExtraThunkArg = undefined> = ThunkDispatch<
  State,
  ExtraThunkArg,
  UnknownAction
>

export type AppDispatch<State, ExtraThunkArg = undefined, BasicAction extends Action = UnknownAction> = ThunkDispatch<
  State,
  ExtraThunkArg,
  BasicAction
>
