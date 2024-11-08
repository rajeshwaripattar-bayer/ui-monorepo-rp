import _ from 'lodash'
import { Filter } from '@gc/types'
import { fuzzySearch } from './search'

export const getFasteStoreKey = (app: string, page: string) => {
  return `${app}_${page}`.toUpperCase()
}

export const getFilteredData = <T>(filters: Filter[], data: T[]) => {
  let filteredData = [...data]
  filters.forEach(({ category, selectedOptions }: Filter) => {
    filteredData = filteredData.filter(
      (data) => !selectedOptions || selectedOptions.length === 0 || selectedOptions.includes(_.get(data, category))
    )
  })
  return filteredData
}

export const searchData = <T>(
  searchTerm: string,
  data: T[],
  searchKeys: string[],
  customSearchFn?: (data: T, searchStr: string) => boolean
) => {
  if (searchTerm === '') {
    return data
  }
  const lowerCaseSearchTerm = searchTerm.toLowerCase()
  let customSearchResult: T[] = [],
    searchKeysResult: T[] = []
  if (searchKeys.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    searchKeysResult = fuzzySearch(lowerCaseSearchTerm, data as any, searchKeys) as any
  }
  if (customSearchFn) {
    customSearchResult = data.filter((row) => customSearchFn(row, lowerCaseSearchTerm))
  }
  return _.uniq([...customSearchResult, ...searchKeysResult])
}
