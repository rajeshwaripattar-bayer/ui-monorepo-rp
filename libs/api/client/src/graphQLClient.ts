import { fetchStore } from '@gc/utils'
import { GraphQLClient, ClientError, Variables } from 'graphql-request'

export type GQLFetchAllPagesArgs<ResponseType> = {
  url: string
  query: string
  queryKey: string
  variables: Variables
  allData?: ResponseType[]
}

export type GQLPostDataArgs = {
  url: string
  mutation: string
  mutationKey: string
  variables: Variables
}

const clientCache: { [key: string]: GraphQLClient } = {}

function getGraphQLClient(url: string) {
  if (!clientCache[url]) {
    clientCache[url] = new GraphQLClient(url, {
      headers: {
        'x-http-caller-id': 'mycrop-farmers-ui',
        'x-http-caller-version': '1'
      }
    })
  }
  clientCache[url].setHeader('Authorization', `Bearer ${fetchStore('gigyaToken')}`)
  return clientCache[url]
}

export async function fetchAllPages<ResponseType>({
  url,
  query,
  queryKey,
  variables = {},
  allData = []
}: GQLFetchAllPagesArgs<ResponseType>): Promise<ResponseType[]> {
  let response
  try {
    response = await getGraphQLClient(url).request(query, variables)
  } catch (error) {
    if (error instanceof ClientError && error.response.data) {
      response = error.response.data
    } else {
      throw error
    }
  }
  const queryResults = response[queryKey]
  const newData = allData.concat(queryResults?.nodes ?? queryResults)

  if (queryResults.pageInfo?.hasNextPage) {
    return fetchAllPages({
      url,
      query,
      queryKey,
      variables: {
        ...variables,
        after: queryResults.pageInfo.endCursor
      },
      allData: newData
    })
  }

  return newData
}

export async function postData<ResponseType>({
  url,
  mutation,
  mutationKey,
  variables
}: GQLPostDataArgs): Promise<ResponseType> {
  let response
  try {
    response = await getGraphQLClient(url).request(mutation, variables)
  } catch (error) {
    if (error instanceof ClientError && error.response.data) {
      response = error.response.data
    } else {
      throw error
    }
  }
  return response[mutationKey]
}
