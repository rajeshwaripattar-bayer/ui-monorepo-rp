import { fetchStore } from '@gc/utils'
import { fetchBaseQuery as rtkFetchBaseQuery, retry, BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query'
import _ from 'lodash'

const fetchBaseQueryWithRetry = retry(rtkFetchBaseQuery(), {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  retryCondition: (error: any, args, extraArgs) =>
    extraArgs.attempt <= 3 && typeof error.status === 'number' && error.status >= 500
})

export function gigyaBaseQuery({ baseUrlKey }: { baseUrlKey: string }) {
  return (args: FetchArgs, api: BaseQueryApi, extraOptions: object) => {
    const combinedArgs = {
      ...args,
      url: `${baseUrlKey}${args.url}`,
      headers: {
        ...args.headers,
        Authorization: `Bearer ${fetchStore('gigyaToken')}`
      }
    }
    return fetchBaseQueryWithRetry(combinedArgs, api, extraOptions)
  }
}
