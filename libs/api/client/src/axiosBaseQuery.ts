import type { BaseQueryApi, BaseQueryFn } from '@reduxjs/toolkit/query'
import type { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import Axios from 'axios'
import { getAzureClient } from './client'
type BaseResponse = {
  httpStatus: 200
  created_at: string
}

export interface AxiosBaseQueryArgs<Meta, Response = BaseResponse> {
  meta?: Meta
  prepareHeaders?: (headers: AxiosRequestHeaders, api: BaseQueryApi) => AxiosRequestHeaders
  transformResponse?: (response: Response) => unknown
  baseURL?: string
}

export interface ServiceExtraOptions {
  authRequired?: boolean
}

const getRequestConfig = (args: string | AxiosRequestConfig) => {
  if (typeof args === 'string') {
    return { url: args }
  }

  return args
}

export const axiosBaseQuery = <
  Args extends AxiosRequestConfig | string = AxiosRequestConfig,
  Result = unknown,
  DefinitionExtraOptions extends ServiceExtraOptions = Record<string, unknown>,
  Meta = Record<string, unknown>
>({
  meta,
  baseURL,
  transformResponse
}: AxiosBaseQueryArgs<Meta> = {}): BaseQueryFn<Args, Result, unknown, DefinitionExtraOptions, Meta> => {
  return async (args, api, extraOptions) => {
    try {
      const requestConfig = getRequestConfig(args)
      const result = await getAzureClient()({
        ...requestConfig,
        baseURL,
        headers: requestConfig.headers,
        ...extraOptions
      })

      return {
        data: transformResponse ? transformResponse(result.data) : result.data
      }
    } catch (err) {
      if (!Axios.isAxiosError(err)) {
        return {
          error: err,
          meta
        }
      }

      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message
        },
        meta
      }
    }
  }
}
