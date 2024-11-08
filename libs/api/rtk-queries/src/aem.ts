import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { TextBlock } from '@gc/types'

export function getTextBlockFromAem(builder: EndpointBuilder<BaseQueryFn, string, 'aemApi'>) {
  return builder.query<TextBlock, { path: string; language?: string }>({
    query: ({ path, language = 'en' }) => {
      return {
        url: '/textblocks',
        params: { path, language }
      }
    }
  })
}
