import fuzzysort from 'fuzzysort'

export function fuzzySearch(searchText: string, data: any[], searchKeys: string[] | null = null) {
  if (!searchText) return data
  const options = {
    keys: searchKeys || Object.keys(data?.[0] || [])
  }
  const result = fuzzysort.go(searchText, data, options)
  return result.map((item) => item.obj)
}
