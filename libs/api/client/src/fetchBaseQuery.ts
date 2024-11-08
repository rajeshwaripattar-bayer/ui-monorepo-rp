import { fetchStore } from '@gc/utils'
import {
  fetchBaseQuery as rtkFetchBaseQuery,
  retry,
  BaseQueryApi,
  FetchArgs as RTKFetchArgs
} from '@reduxjs/toolkit/query'
import _ from 'lodash'

export type FetchArgs = RTKFetchArgs & { federationId?: string }

const fetchBaseQueryWithRetry = retry(rtkFetchBaseQuery(), {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  retryCondition: (error: any, args, extraArgs) =>
    extraArgs.attempt <= 3 && typeof error.status === 'number' && error.status >= 500
})

export function fetchBaseQuery({ baseUrlKey }: { baseUrlKey: string }) {
  return (args: FetchArgs, api: BaseQueryApi, extraOptions: object) => {
    const combinedArgs = {
      ...args,
      url: `${_.get(fetchStore('domainDef'), baseUrlKey) ?? ''}${args.url ?? ''}`,
      headers: {
        ...args.headers,
        Authorization: `Bearer ${fetchStore('gigyaToken')}`,
        ...(args.federationId && { federationId: args.federationId })
      }
    }
    return fetchBaseQueryWithRetry(combinedArgs, api, extraOptions)
  }
}
