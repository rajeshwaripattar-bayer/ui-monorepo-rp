import { fetchStore } from '@gc/utils'
import { fetchAllPages, postData, GQLFetchAllPagesArgs, GQLPostDataArgs } from './graphQLClient'
import _ from 'lodash'

type ResponseError<T> = {
  response: {
    status: number
    data?: T
    errors?: {
      message: string
    }
  }
}

function isResponseError<ResponseType>(error: unknown): error is ResponseError<ResponseType> {
  return typeof error === 'object' && error !== null && 'response' in error
}

function isPost<ResponseType>(args: GQLPostDataArgs | GQLFetchAllPagesArgs<ResponseType>): args is GQLPostDataArgs {
  return (args as GQLPostDataArgs).mutation !== undefined
}

export function graphQLBaseQuery({ baseUrlKey }: { baseUrlKey: string }) {
  return async <ResponseType>(args: GQLFetchAllPagesArgs<ResponseType> | GQLPostDataArgs) => {
    const combinedArgs = {
      ...args,
      url: `${_.get(fetchStore('domainDef'), baseUrlKey)}${args.url ?? ''}`
    }
    try {
      const data = await (isPost<ResponseType>(combinedArgs)
        ? postData<ResponseType>(combinedArgs)
        : fetchAllPages<ResponseType>(combinedArgs))
      return { data }
    } catch (error) {
      if (isResponseError<ResponseType>(error)) {
        return {
          // make serializable for redux cache
          error: {
            status: error.response.status,
            data: error.response.data,
            message: error.response.errors
          }
        }
      }
      return { error }
    }
  }
}
