import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { creditLimit } from '@gc/types'

export function getCreditLimitQuery(builder: EndpointBuilder<BaseQueryFn, string, 'financeApi'>) {
  return builder.query<
    creditLimit,
    {
      payload: { selectedSapId: string; creditControlNumber: string }
      headers: { 'sap-instance': string; 'customer-number': string }
    }
  >({
    query: ({ payload, headers }) => {
      return {
        url: '/grower-finance-widget',
        method: 'POST',
        headers,
        body: payload
      }
    }
  })
}
