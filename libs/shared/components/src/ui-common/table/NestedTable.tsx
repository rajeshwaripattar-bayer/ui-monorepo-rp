import { IconButton } from '@element/react-icon-button'
import { TableTopBar } from '@element/react-table'
import { Textfield } from '@element/react-textfield'
import { useAppSessionData, useUpsertAppSessionData } from '@gc/hooks'
import { fuzzySearch } from '@gc/utils'
import _ from 'lodash'
import { Fragment, ReactNode, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './NestedTable.module.scss'
import Table, { HeaderType, TableProps } from './Table'

type Data<T, P> = { rows: T[]; tableData: P }
export interface NestedTableProps<T, P> {
  title: string | ReactNode
  searchable?: boolean
  customTopBar?: ReactNode
  trailingTopBarSlot?: ReactNode
  data: Data<T, P>[]
  headers: HeaderType<T>[]
  tableProps?: Omit<TableProps<T>, 'data' | 'headers'>
  tableKey?: string
  tableTopBar?: (data: Data<T, P>) => ReactNode
  fasteStoreKey?: string
  noMatchingDataContingency?: ReactNode
  customSearchFn?: (data: T, searchStr: string) => boolean
}

export function NestedTable<T, P>({
  title,
  data,
  headers,
  tableProps,
  tableKey,
  tableTopBar,
  searchable,
  fasteStoreKey,
  noMatchingDataContingency,
  trailingTopBarSlot,
  customSearchFn
}: NestedTableProps<T, P>) {
  const { t } = useTranslation()
  const [upsertAppSessionData] = useUpsertAppSessionData()
  const appSessionData = useAppSessionData()
  const [searchTerm, setSearchTerm] = useState<string>(
    _.get(appSessionData, `${fasteStoreKey}.searchTerm`, '') as string
  )

  const getDisplayTableData = useCallback(
    (data: T[]) => {
      if (searchable && searchTerm !== '') {
        const lowerCaseSearchTerm = searchTerm.toLowerCase()
        let searchKeysResult: T[] = [],
          customSearchResult: T[] = []
        const searchKeys = headers.filter((h) => h.searchable).map((h) => h.accessor as string)
        if (searchKeys.length) {
          searchKeysResult = fuzzySearch(lowerCaseSearchTerm, data, searchKeys)
        }
        if (customSearchFn) {
          customSearchResult = data.filter((data) => customSearchFn?.(data, lowerCaseSearchTerm))
        }
        // Union is required here, in case consumer of the Table wants to do both searchable columns and custom search function!!
        return _.uniq([...customSearchResult, ...searchKeysResult])
      } else {
        return data
      }
    },
    [headers, searchTerm, searchable, customSearchFn]
  )

  const renderTables = useMemo(() => {
    const displayTables: ReactNode[] = []
    data.forEach((item, index) => {
      const displayData = getDisplayTableData(item.rows)
      if (displayData.length) {
        displayTables.push(
          <Fragment key={`${tableKey}${index}read`}>
            <Table<T> {...tableProps} headers={headers} data={displayData} customTopBar={tableTopBar?.(item)} />
          </Fragment>
        )
      }
    })
    return displayTables.length ? displayTables : noMatchingDataContingency
  }, [data, getDisplayTableData, headers, tableKey, tableProps, tableTopBar, noMatchingDataContingency])

  const actions = useMemo(
    () => (
      <>
        {searchable && (
          <Textfield
            className={styles.search}
            variant='embedded'
            leadingIcon='search'
            defaultValue={searchTerm}
            label={t('common.search.label')}
            dense
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => {
              const searchTerm = e.target.value
              setSearchTerm?.(searchTerm)
              if (fasteStoreKey) {
                upsertAppSessionData(fasteStoreKey, { searchTerm })
              }
            }}
            trailingIcon={
              searchTerm ? (
                <IconButton
                  onClick={() => {
                    setSearchTerm?.('')
                    if (fasteStoreKey) {
                      upsertAppSessionData(fasteStoreKey, { searchTerm: '' })
                    }
                  }}
                  icon='close'
                />
              ) : null
            }
          />
        )}
        {trailingTopBarSlot && <div className={styles.trailing_top_bar_slot}>{trailingTopBarSlot}</div>}
      </>
    ),
    [fasteStoreKey, searchTerm, searchable, setSearchTerm, t, upsertAppSessionData, trailingTopBarSlot]
  )

  return (
    <div className={styles.container}>
      <TableTopBar title={title} actions={actions} />
      {renderTables}
    </div>
  )
}

export default NestedTable
