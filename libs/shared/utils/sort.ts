import _ from 'lodash'

type SortableCol = {
  accessor?: unknown
  defaultSort?: string
  defaultSortOrder?: number
}

export const sortByColConfig = <T>(data: T[], sortableCols: SortableCol[]) => {
  const sortConfig = _(sortableCols)
    .filter((conf) => typeof conf.accessor === 'string' && ['asc', 'desc'].includes(conf.defaultSort ?? ''))
    .sortBy('defaultSortOrder')
    .reduce(
      (acc, conf) => {
        acc.accessors.push(conf.accessor as string)
        acc.order.push(conf.defaultSort as 'asc' | 'desc')
        return acc
      },
      { accessors: [] as string[], order: [] as ('asc' | 'desc')[] }
    )
  return _.orderBy(data, sortConfig.accessors, sortConfig.order) as T[]
}
