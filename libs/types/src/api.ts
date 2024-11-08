import type { reactHooksModuleName } from '@reduxjs/toolkit/dist/query/react'
import type { Api, BaseQueryFn, coreModuleName, EndpointDefinitions } from '@reduxjs/toolkit/query'

export type InferQueryArg<S, T extends keyof S> = S[T] extends { Types: { QueryArg: infer Q } } ? Q : never
export type InferResultType<S, T extends keyof S> = S[T] extends { Types: { ResultType: infer R } } ? R : never

export type ApiSlice<ReducerPath extends string, Definitions extends EndpointDefinitions = NonNullable<unknown>> = Api<
  BaseQueryFn,
  Definitions,
  ReducerPath,
  string,
  typeof coreModuleName | typeof reactHooksModuleName
>

export type QueryArg<Endpoints, T extends keyof Endpoints> = InferQueryArg<Endpoints, T>
export type ResultType<Endpoints, T extends keyof Endpoints> = InferResultType<Endpoints, T>
