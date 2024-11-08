import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import { Account } from '@gc/types'
import { appendLeadingZeros, fetchStore, trimObjectValues, toUId } from '@gc/utils'
import _ from 'lodash'

type SearchAccount = {
  name: string
  irdAccountNumber: string
  licenseStatus: string
  sapAccountId: string
  gln: string[] | string
  city: string
  state: string
  zip: string
  contactName: string
  crtva: string
  orgType: string[]
}

type SearchAccountResponse = {
  accounts: SearchAccount[]
  pagination: {
    totalCount: number
    totalPages: number
  }
  sorts: string[]
}

type HierarchyAccount = {
  accountName: string
  irdId: string
  sapAccountId: string
  accountType: string
  address: {
    city: string
    state: string
    zip: string
  }
  children?: HierarchyAccount[]
}
type HierarchyAccountsResponse = { accounts: [{ key: string; value: HierarchyAccount }] }

export type SearchForm = { [char: string]: string }

function transformSearchAccount(response: SearchAccountResponse) {
  return (
    response.accounts?.map((account) => {
      const grower = account.orgType.includes('GROWER') ? 'GROWER' : null
      const dealer = account.orgType.includes('DEALER') ? 'DEALER' : null
      const both = grower && dealer ? 'BOTH' : null
      return {
        accountName: account.name,
        irdId: account.irdAccountNumber,
        sapAccountId: account.sapAccountId,
        uId: toUId(account.sapAccountId, account.irdAccountNumber),
        accountType: both ?? dealer ?? grower,
        city: account.city,
        state: account.state,
        zipCode: account.zip,
        licenseStatus: account.licenseStatus,
        gln: Array.isArray(account.gln) ? account.gln.join(', ') : account.gln,
        contactName: account.contactName,
        crtva: account.crtva
      }
    }) || []
  )
}

function transformHierarchyAccounts(response: HierarchyAccountsResponse) {
  const accounts: Account[] = []
  const topAccount = response.accounts?.filter((lob) => lob.key === 'SEED')[0]?.value || null
  if (!topAccount) return accounts

  const getChildAccountDetails = (account: HierarchyAccount) => {
    accounts.push({
      accountName: account.accountName,
      irdId: account.irdId,
      sapAccountId: appendLeadingZeros(account.sapAccountId),
      uId: toUId(account.sapAccountId, account.irdId),
      accountType: 'DEALER',
      city: account.address.city,
      state: account.address.state,
      zipCode: account.address.zip
    })

    if (account.children?.length) {
      account.children.forEach(getChildAccountDetails)
    }
  }

  getChildAccountDetails(topAccount)

  return accounts
}

export function searchAccounts(builder: EndpointBuilder<BaseQueryFn, string, 'acsCommonApi'>) {
  return builder.query<Account[], { formValues: SearchForm; updatePartial?: (accounts: Account[]) => void }>({
    queryFn: async ({ formValues, updatePartial }, api, extraOptions, baseQuery) => {
      try {
        const url = '/US/accounts/search'

        const trimmedFormValues = trimObjectValues(formValues)
        const params = {
          ..._.omit(trimmedFormValues, ['licenseStatus', 'accountNumber']),
          licenseStatuses: trimmedFormValues.licenseStatus === 'all' ? '' : trimmedFormValues.licenseStatus,
          irdAccountNumber: trimmedFormValues.accountNumber || '',
          active: true,
          pageSize: 1000,
          currentPage: 0
        }
        const cleanedParams = _.omitBy(params, (value) => typeof value === 'string' && _.isEmpty(value))

        const data: Account[] = []
        let response
        do {
          response = (await baseQuery({ url, params: cleanedParams })) as { data: SearchAccountResponse }
          data.push(...transformSearchAccount(response.data))
          if (updatePartial) updatePartial(data)
          cleanedParams.currentPage++
        } while (cleanedParams.currentPage < response.data.pagination.totalPages)

        return { data }
      } catch (error) {
        return { error }
      }
    },
    keepUnusedDataFor: 3600,
    serializeQueryArgs: () => 'search_accounts',
    providesTags: ['SearchAccounts']
  })
}

export function getDealerAccountHierarchy(builder: EndpointBuilder<BaseQueryFn, string, 'acsCommonApi'>) {
  return builder.query<Account[], void>({
    query: () => {
      const { uid } = fetchStore('selectedAccount')
      return {
        url: '/hierarchyAccounts',
        params: {
          customerNumber: uid
        }
      }
    },
    transformResponse: (response: HierarchyAccountsResponse) => {
      return transformHierarchyAccounts(response)
    }
  })
}

export function getDealerAssociatedGrowerFvAccounts(builder: EndpointBuilder<BaseQueryFn, string, 'nbmApi'>) {
  return builder.query<void, void>({
    query: () => {
      const { brandFamily } = fetchStore('domainDef').gcPortalConfig
      return {
        url: '/v1/fieldview/accounts',
        params: {
          brand: brandFamily
        }
      }
    }
  })
}
