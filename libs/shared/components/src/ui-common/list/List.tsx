import { List as ElementList, ListItem, ListDivider } from '@element/react-list'
import styles from './List.module.scss'
import FilterChip from '../filter/FilterChip'
import SortingChip from '../sorting/SortingChip'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { Filter, SelectedFilter, SortByData } from '@gc/types'
import { MessageWithAction } from '../../ui-common/message-with-action/MessageWithAction'
import { useAppSessionData, useUpdateFasteStore } from '@gc/hooks'
import _ from 'lodash'
import { getFilteredData, searchData } from '@gc/utils'
import { useTranslation } from 'react-i18next'

export interface ItemProps<T> {
  code?: string
  row?: T | undefined
  trailingBlock?: React.ReactNode
  leadingBlock?: React.ReactNode
  overlineText?: React.ReactNode
  primaryText?: React.ReactNode
  secondaryText?: React.ReactNode
  trailingBlockWithAction?: React.ReactNode
}

export interface ListProps<T> {
  leadingBlockType?: string
  items: ItemProps<T>[]
  onAction?: (code: string, item: T | undefined) => void
  onTrailingBlockAction?: (code: string) => void
  divider?: boolean
  className?: string
  listItemClassName?: string
  noHover?: boolean
  trailingBlockType?: string
  filterProps?: {
    filters: {
      title: string
      accessor: string
    }[]
  }
  data?: Array<T>
  dataToListItem?: (dataRow: T) => object
  sortProps?: {
    options: {
      label: string
      columnName: string
      sortingType: string
    }[]
  }
  searchTerm?: string
  searchFn?: (data: T, searchStr: string) => boolean
  fasteStoreKey?: string
}

export function List<T>(props: ListProps<T>) {
  const {
    fasteStoreKey,
    data,
    dataToListItem,
    items,
    searchTerm = '',
    onTrailingBlockAction,
    noHover,
    leadingBlockType,
    listItemClassName,
    divider,
    onAction,
    searchFn
  } = props
  const appSessionData = useAppSessionData()
  const [updateFaste] = useUpdateFasteStore()
  const getFilterList = useCallback(() => {
    const filtersWithOptions: Filter[] = []
    const existingFilters = _.get(appSessionData, `${fasteStoreKey}.filters`) as SelectedFilter
    const filterColumns = props.filterProps?.filters || []
    filterColumns.forEach(({ title, accessor }: { title: string; accessor: string }) => {
      filtersWithOptions.push({
        category: accessor,
        title,
        options: _.uniq(data?.map((row: T) => _.get(row, accessor as string)) as string[]),
        selectedOptions: existingFilters ? existingFilters[accessor as string] : []
      })
    })
    return filtersWithOptions.filter((f) => f.options.length > 1)
  }, [appSessionData, data, fasteStoreKey, props.filterProps?.filters])
  const [filterList, setFilterList] = useState<Filter[]>(getFilterList)
  const [sortBy, setSortBy] = useState<string>(_.get(appSessionData, `${fasteStoreKey}.sortBy`, '') as string)
  const [filteredData, setFilteredData] = useState<(ReactElement | undefined)[]>([])
  const { t } = useTranslation()

  useEffect(() => {
    const _filterList = getFilterList()
    if (_filterList.length) {
      setFilterList(_filterList)
    }
  }, [getFilterList])

  useEffect(() => {
    if (_.isString(searchTerm) && fasteStoreKey) {
      const sessionData = _.get(appSessionData, `${fasteStoreKey}`, {})
      updateFaste('appSessionData', { ...appSessionData, [fasteStoreKey]: { ...sessionData, searchTerm } })
    }
  }, [searchTerm, fasteStoreKey]) // appSessionData, fasteStoreKey, searchTerm, updateFaste

  const handleOnClick = useCallback(
    (code: string, item: T | undefined) => {
      onAction && onAction(code, item)
    },
    [onAction]
  )

  const listItems = useCallback(
    (item: ItemProps<T>, index: number) => (
      <div className={styles['wrapper-list-item']} key={`wrapper-${index}`}>
        <ListItem
          className={listItemClassName}
          key={`list-item-${index}`}
          onClick={() => handleOnClick(item.code ?? '', item.row)}
          primaryText={item.primaryText ?? ''}
          secondaryText={item.secondaryText ?? ''}
          overlineText={item.overlineText ?? ''}
          trailingBlock={item.trailingBlock ?? ''}
          leadingBlock={item.leadingBlock ?? ''}
          leadingBlockType={leadingBlockType ?? ''}
          noHover={noHover ?? false}
        ></ListItem>
        {item.trailingBlockWithAction && (
          <span
            className={styles['trailing_block_action']}
            onClick={() => onTrailingBlockAction && onTrailingBlockAction(item.code ?? '')}
          >
            {item.trailingBlockWithAction ?? ''}
          </span>
        )}
        {divider && index !== items.length - 1 && <ListDivider key={`divider-${index}`} />}
      </div>
    ),
    [divider, handleOnClick, items.length, leadingBlockType, listItemClassName, noHover, onTrailingBlockAction]
  )

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const _sortBy = event.target.value
    if (!_.isString(_sortBy)) return

    setSortBy(_sortBy)
    if (fasteStoreKey) {
      const sessionData = _.get(appSessionData, `${fasteStoreKey}`, {})
      updateFaste('appSessionData', { ...appSessionData, [fasteStoreKey]: { ...sessionData, sortBy: _sortBy } })
    }
  }

  useEffect(() => {
    let result = getFilteredData<T>(filterList, data || [])
    if (!_.isEmpty(searchTerm)) {
      result = searchData(searchTerm || '', result, [], searchFn)
    }

    const toSortBy = _.isObject(sortBy) ? (sortBy as SortByData).id : sortBy
    if (_.isString(toSortBy)) {
      const split = toSortBy.split('-')
      result = _.orderBy(result, split[0], split[1] as 'asc' | 'desc')
    }

    const filteredData = result.map((dataItem, index) => dataToListItem && listItems(dataToListItem(dataItem), index))
    setFilteredData(filteredData)
  }, [filterList, sortBy, data, dataToListItem, listItems, searchTerm, searchFn])

  const renderFilterContainer = filterList.length > 0 || (props.sortProps && props.sortProps.options.length > 0)
  return (
    <>
      {renderFilterContainer && (
        <div className={styles.filter_container}>
          {filterList.length > 0 && (
            <FilterChip
              leadingIcon='tune'
              filterList={filterList}
              chipLabel='Filters'
              applyFilters={(selectedFilters) => {
                const updatedFilterList = _.cloneDeep(filterList)
                updatedFilterList.forEach((f) => {
                  f.selectedOptions = selectedFilters[f.category] || f.selectedOptions
                })
                setFilterList(updatedFilterList)

                if (fasteStoreKey) {
                  const sessionData = _.get(appSessionData, `${fasteStoreKey}`)
                  updateFaste('appSessionData', {
                    ...appSessionData,
                    [fasteStoreKey]: {
                      ...sessionData,
                      filters: { ...(sessionData?.filters || {}), ...selectedFilters }
                    }
                  })
                }
              }}
              isAllFilters={true}
              key='all_filters'
            />
          )}
          {props.sortProps && props.sortProps?.options.length > 0 && (
            <div className={filterList.length > 0 ? styles.sorting_chip_container : ''}>
              <SortingChip
                sortingList={props.sortProps.options}
                chipLabel={props.sortProps.options[0].label}
                chipValue={`${props.sortProps.options[0].columnName}-${props.sortProps.options[0].sortingType}`}
                handleSortChange={handleSortChange}
                leadingIcon='import_export'
              />
            </div>
          )}
        </div>
      )}
      {data?.length && !filteredData.length && searchTerm.trim().length > 0 ? (
        <MessageWithAction
          messageHeader={t('common.no_results_message_header_label')}
          messageDescription={t('common.no_results_message_description')}
          iconProps={{
            icon: 'info_outline',
            variant: 'filled-secondary',
            className: 'lmnt-theme-secondary-200-bg'
          }}
        />
      ) : (
        <ElementList
          className={props.className}
          trailingBlockType={props.trailingBlockType ?? 'meta'}
          leadingBlockType={items.some((item) => item.leadingBlock) ? 'icon' : ''}
        >
          {data?.length && dataToListItem ? filteredData : props.items?.map((item, index) => listItems(item, index))}
        </ElementList>
      )}
    </>
  )
}

export default List
