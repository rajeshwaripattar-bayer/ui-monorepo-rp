/* eslint-disable @typescript-eslint/no-explicit-any */
import { Icon } from '@element/react-icon'
import { IconButton } from '@element/react-icon-button'
import { Table as ElementTable, TableTopBar } from '@element/react-table'
import { Textfield } from '@element/react-textfield'
import { TypoLink } from '@element/react-typography'
import _ from 'lodash'
import React, { ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Badge from '../badge/Badge'
import { FooterWithRef, HandleTemplateUpdate as HandleFooterUpdate } from './FooterWithRef'
import { HandleTemplateUpdate as HandleLeadingContentUpdate, LeadingContentWithRef } from './LeadingContentWithRef'
import type { DataUpdateHandle } from './RefWrapper'
import styles from './Table.module.scss'
import DisplayTemplateColumn from './editable-columns/DisplayTemplateColumn'
import IconButtonColumn, { IconButtonColumnProps } from './editable-columns/IconButtonColumn'
import SegmentedButtonColumn, { SegmentedButtonColumnProps } from './editable-columns/SegmentedButtonColumn'
import SelectColumn, { SelectColumnProps } from './editable-columns/SelectColumn'
import SwitchColumn, { SwitchColumnProps } from './editable-columns/SwitchColumn'
import TextfieldColumn, { TextfieldColumnProps } from './editable-columns/TextfieldColumn'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useAppSessionData, useUpsertAppSessionData } from '@gc/hooks'
import { Filter, SelectedFilter } from '@gc/types'
import { downloadXlsx, fuzzySearch, getCSVColumns, getFilteredData } from '@gc/utils'
import { Datas } from 'react-csv-downloader/dist/esm/lib/csv'
import FilterBar from '../filter/FilterBar'
// eslint-disable-next-line @nx/enforce-module-boundaries
import Flag from '../flag/Flag'
import FlagLabel from '../flag/FlagLabel'
import RadioMenuColumn, { RadioMenuColumnProps } from './editable-columns/RadioMenuColumn'
import { Option } from '@gc/components/types'

// for each row, we can mention list of coln in arr to be disabled. It takes header accessor list
type RowData<T> = T & { rowIndex: number; disableCols?: string[]; subRows?: RowData<T>[] }
type EditType = 'select' | 'textfield' | 'switch' | 'iconButton' | 'segmentedButton' | 'radioMenu' | 'custom'
type ColumnSortBy = { id: string; desc: false; order: number }
export interface HeaderType<T> {
  header: string
  excludeFromDownload?: boolean
  accessor?: string | ((a: RowData<T>) => ReactNode)
  displayTemplate?: (a: any, b: RowData<T>) => ReactNode | string
  width?: number
  widthPercentage?: number
  cellProps?: object
  align?: string
  fixed?: boolean
  disableSortBy?: boolean
  displayType?: string
  defaultSort?: string
  defaultSortOrder?: number
  sortType?: ((a: any, b: any) => any) | string
  id?: string
  type?: string
  editProps?: {
    editType: EditType
    textfieldProps?: Omit<TextfieldColumnProps, 'row' | 'onChange' | 'onBlur' | 'accessor' | 'value' | 'max'> & {
      onChange: (val: string, row: RowData<T>) => void
      onBlur?: (val: string, row: RowData<T>) => void
      isWholeNumber?: boolean
      decimalPlaces?: number
      max?: ((val: string | number, row: RowData<T>) => number | undefined) | number
    }
    switchProps?: Omit<SwitchColumnProps, 'row' | 'onChange'> & {
      onChange: (val: boolean, row: RowData<T>) => void
    }
    segmentedButtonProps?: Omit<SegmentedButtonColumnProps, 'row' | 'onClick'> & {
      onClick: (val: string, row: RowData<T>) => void
    }
    selectProps?: Omit<SelectColumnProps, 'row' | 'onChange' | 'options' | 'value' | 'handleChange' | 'accessor'> & {
      onChange: (selected: { value: string; text: string }, row: RowData<T>, applyAllRows?: boolean) => void
      options: Array<{ value: string; text: string }>
      applyToAllRowsLabel?: string
    }
    iconButtonProps?: Omit<IconButtonColumnProps, 'row' | 'iconButtonProps'> & {
      iconButtonProps: Omit<IconButtonColumnProps['iconButtonProps'], 'onClick'> & {
        onClick: (data: any) => void
      }
    }
    radioMenuProps?: Omit<RadioMenuColumnProps, 'row' | 'onChange' | 'value' | 'handleChange' | 'accessor'> & {
      onChange: (selected: { value: string; text: string }, row: RowData<T>, applyAllRows?: boolean) => void
    }
  }
  onLinkClick?: (b: RowData<T>) => void
  filterable?: boolean
  searchable?: boolean
}

type CellRefs = {
  type: EditType | undefined
  handle: React.RefObject<DataUpdateHandle>
}[][]

const configureBooleanColumn = <T,>(header: HeaderType<T>) => {
  return {
    ...header,
    align: 'center',
    displayTemplate: (value: boolean) => (['1', 'true', true, 1].includes(value) ? <Icon icon='check'></Icon> : '')
  }
}

const configureLinkColumn = <T,>(header: HeaderType<T>) => {
  return {
    ...header,
    displayTemplate: (label: string, row: RowData<T>) => {
      const disableLinkStyles = (
        row?.disableCols?.includes(header.accessor as string)
          ? { pointerEvents: 'none', opacity: '0.5', textDecoration: 'underline', cursor: 'not-allowed' }
          : {}
      ) as React.CSSProperties
      return (
        <TypoLink style={disableLinkStyles} onClick={() => header.onLinkClick && header.onLinkClick(row)}>
          {label}
        </TypoLink>
      )
    }
  }
}

const configureBadgeColumn = <T,>(header: HeaderType<T>) => {
  return {
    ...header,
    displayTemplate: (label: string) => <Badge labelText={label} />
  }
}

const configureFlagColumn = <T,>(header: HeaderType<T>) => {
  return {
    ...header,
    disableSortBy: true,
    headerCellProps: {
      className: styles.flag_header
    },
    cellProps: {
      className: styles.flag_cell
    },
    displayTemplate: (value: boolean) => (value ? <Flag /> : '')
  }
}

export interface TableProps<T> {
  noBorder?: boolean
  noHover?: boolean
  layout?: string
  data: Array<T>
  paginated?: boolean
  noContentMessage?: ReactNode
  title?: string
  headers: HeaderType<T>[]
  expandedRowTemplate?: (a: any) => ReactNode
  filterBar?: ReactNode
  footerContent?: ReactNode
  customTopBar?: ReactNode
  className?: string
  style?: React.CSSProperties
  containerProps?: object
  editable?: boolean
  searchable?: boolean
  customSearchFn?: (data: T, searchStr: string) => boolean
  enableCsvDownload?: boolean
  csvFileName?: string
  fasteStoreKey?: string
  expandable?: boolean
}

export function Table<T>(props: TableProps<T>) {
  const { t } = useTranslation()
  const [upsertAppSessionData] = useUpsertAppSessionData()
  const appSessionData = useAppSessionData()

  const {
    title,
    expandedRowTemplate,
    filterBar,
    paginated,
    customTopBar,
    layout = 'standard',
    editable,
    enableCsvDownload,
    csvFileName,
    searchable,
    fasteStoreKey,
    customSearchFn,
    footerContent,
    expandable,
    ...tableProps
  } = props
  const tableRef = useRef<HTMLDivElement>(null)
  const [filterList, setFilterList] = useState<Filter[]>([])
  const [flaggedCols, setFlaggedCols] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<ColumnSortBy[]>(
    (_.get(appSessionData, `${fasteStoreKey}.sortBy`) as ColumnSortBy[]) || []
  )
  const [searchTerm, setSearchTerm] = useState<string>(
    _.get(appSessionData, `${fasteStoreKey}.searchTerm`, '') as string
  )
  const existingFilters = _.get(appSessionData, `${fasteStoreKey}.filters`) as SelectedFilter
  const [headers, setHeaders] = useState<HeaderType<T>[]>(props.headers)
  const [cachedHeaders, setCachedHeaders] = useState<HeaderType<T>[]>(props.headers) // This is for EDITABLE table only. It is used to keep editable columns in sync without re rendering Table!
  const dynamicWidthHeaders = layout !== 'standard' && props.headers.filter((h) => h.widthPercentage).length > 0
  const [renderTable, setRenderTable] = useState(!dynamicWidthHeaders)
  const [selectApplyAll, setSelectApplyAll] = useState<{ [key: string]: boolean }>({})
  const data = useMemo(() => props.data.map((row, index) => ({ ...row, rowIndex: index })), [props.data])
  const [cellRefs, setCellRefs] = useState<CellRefs>([])
  const [tableData, setTableData] = useState(data)

  useEffect(() => {
    if (editable) {
      // TODO Optimize to not use JSON.stringify
      if (!_.isEqual(JSON.stringify(props.headers), JSON.stringify(cachedHeaders))) {
        props.headers.forEach((header) => {
          Object.keys(header.editProps || {}).forEach((_key) => {
            const key = _key as keyof HeaderType<T>['editProps']
            if (key === 'editType') return
            const current = cachedHeaders.find((h) => !!(h.editProps && h.editProps[key]))
            if (
              header.editProps &&
              current?.editProps &&
              JSON.stringify(header.editProps[key]) !== JSON.stringify(current?.editProps[key])
            ) {
              setCachedHeaders(props.headers)
              tableData.forEach((_d, index) => {
                cellRefs[index]?.forEach(({ type, handle }) => {
                  if (_key.startsWith(type || '') && handle.current?.updateProps) {
                    handle.current.updateProps(header.editProps && header.editProps[key])
                  }
                })
              })
            }
          })
        })
      }
    }
  }, [cachedHeaders, cellRefs, editable, props.headers, tableData])

  // EDITABLE table only - dataRef is a reference to updated data that goes into table, its required to keep all call back functions updated without re rendering the whole table.
  const dataRef = useRef<
    (T & {
      rowIndex: number
    })[]
  >([])
  dataRef.current = data
  const footerRef = useRef<HandleFooterUpdate>(null)
  const leadingContentRef = useRef<HandleLeadingContentUpdate>(null)

  const expandedProps = expandable || expandedRowTemplate ? { expandable: true, expandedRowTemplate } : {}
  const paginationProps = paginated ? { paginated: true, paginationProps: { initialItemsPerPage: 25 } } : {}

  useEffect(() => {
    if (editable && footerRef?.current) {
      footerRef?.current.reRenderFooter(props.footerContent)
    }
  }, [footerRef, props.footerContent, editable])

  useEffect(() => {
    if (editable && leadingContentRef?.current) {
      leadingContentRef?.current.reRenderLeadingContent(props.customTopBar)
    }
  }, [leadingContentRef, props.customTopBar, editable])

  useEffect(() => {
    if (editable) {
      const [edit, read] = _.partition(headers, (h) => !!h.editProps || !!h.displayTemplate)
      const editRelatedColumns = edit.map((h) => h.accessor as string)
      const readOnlyColumns = read.map((h) => h.accessor as string)

      const readOnlyUpdatedData = data.map((d) => _.pick(d, readOnlyColumns))
      const readOnlyCurrentData = tableData.map((d) => _.pick(d, readOnlyColumns))
      if (data.length !== tableData.length || !_.isEqual(readOnlyUpdatedData, readOnlyCurrentData)) {
        // Here we will do setTableData when a change is detected outside editable or edit-impacted columns!
        setTableData(data)
      } else {
        // Here we will mutate edit related columns directly to avoid re rendering entire table!
        const editableUpdatedData = data.map((d) => _.pick(d, editRelatedColumns))
        const editableCurrentData = tableData.map((d) => _.pick(d, editRelatedColumns))
        editableUpdatedData.forEach((d, index) => {
          if (!_.isEqual(d, editableCurrentData[index])) {
            for (const [key, value] of Object.entries(d)) {
              _.set(tableData[index], key, value)
              cellRefs[index]?.forEach(({ handle }) => {
                if (handle.current?.updateMatchingData) {
                  handle.current.updateMatchingData(data)
                }
              })
            }
          }
        })
      }
    }
    // useEffect has custom dependencies of data & editable because table is maintaining its own copy of data after any edit,
    // so re render only needed if original data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, editable])

  // @ts-expect-error TS knows about missing types for expanderCellTemplate props
  const expanderCellTemplate = ({ row }) =>
    row.canExpand || expandedProps.expandedRowTemplate ? (
      <IconButton
        iconSize='medium'
        id={row.isExpanded ? 'arrow_up' : 'arrow_down'}
        icon={`keyboard_arrow_${row.isExpanded ? 'up' : 'down'}`}
        {...row.getToggleRowExpandedProps({
          style: {
            marginLeft: `${row.depth * 2}rem`
          }
        })}
      />
    ) : (
      <div />
    )

  const updateHeaderForEdit = (header: HeaderType<T>, refs: CellRefs) => {
    const { editProps = { editType: '' } } = header
    const { editType } = editProps

    const elementWithRef = (index: number, element: ReactElement | null) => {
      if (element && refs[index]) {
        refs[index].push({ type: header.editProps?.editType, handle: React.createRef<DataUpdateHandle>() })
        return React.cloneElement(element, { ref: refs[index].at(-1)?.handle })
      }
    }

    if (editType === 'textfield' && editProps.textfieldProps) {
      const {
        textfieldProps: { onChange, onBlur, max, ...textfieldProps }
      } = editProps

      header.displayTemplate = (value: number, row: RowData<T>) =>
        elementWithRef(
          row.rowIndex,
          <TextfieldColumn
            {...textfieldProps}
            max={max && typeof max !== 'number' ? max(value, dataRef.current[row.rowIndex]) : max}
            onChange={(val: string) => onChange(val, dataRef.current[row.rowIndex])}
            onBlur={(val: string) => onBlur && onBlur(val, dataRef.current[row.rowIndex])}
            value={value}
            row={row}
            accessor={header.accessor as string}
          />
        )
    } else if (editType === 'select' && editProps.selectProps) {
      const {
        selectProps: { onChange, options, applyToAllRowsLabel, ...selectProps }
      } = editProps
      header.displayTemplate = (value: string, row: RowData<T>) =>
        elementWithRef(
          row.rowIndex,
          <SelectColumn
            {...selectProps}
            row={row}
            accessor={header.accessor as string}
            handleChange={(selected: { value: string; text: string }, applyAllRows: boolean) => {
              if (applyAllRows) {
                tableData.forEach((row) => {
                  _.set(row, header.accessor as string, selected)
                })
                setSelectApplyAll({ [header.accessor as string]: applyAllRows })
              } else if (
                selectApplyAll[header.accessor as string] &&
                !_.isEqual(applyAllRows, selectApplyAll[header.accessor as string])
              ) {
                setSelectApplyAll({ [header.accessor as string]: applyAllRows })
              }
              onChange(selected, dataRef.current[row.rowIndex], applyAllRows)
            }}
            value={value}
            options={options || []}
            {...(applyToAllRowsLabel
              ? {
                applyToAllProps: {
                  applied: selectApplyAll[header.accessor as string],
                  label: applyToAllRowsLabel
                }
              }
              : {})}
          />
        )
    } else if (editType === 'switch' && editProps.switchProps) {
      const {
        switchProps: { onChange }
      } = editProps
      header.displayTemplate = (value: boolean, row: RowData<T>) =>
        elementWithRef(
          row.rowIndex,
          editProps.switchProps ? (
            <SwitchColumn
              {...editProps.switchProps}
              row={dataRef.current[row.rowIndex]}
              checked={value}
              onChange={(val) => onChange(val, dataRef.current[row.rowIndex])}
            />
          ) : null
        )
    } else if (editType === 'segmentedButton' && editProps.segmentedButtonProps) {
      const {
        segmentedButtonProps: { onClick }
      } = editProps
      header.displayTemplate = (value: string, row: RowData<T>) =>
        elementWithRef(
          row.rowIndex,
          editProps.segmentedButtonProps ? (
            <SegmentedButtonColumn
              {...editProps.segmentedButtonProps}
              row={row}
              selectedValue={value}
              onClick={(val: string) => onClick(val, dataRef.current[row.rowIndex])}
            />
          ) : null
        )
    } else if (editType === 'iconButton' && editProps.iconButtonProps) {
      const {
        iconButtonProps: { iconButtonProps }
      } = editProps
      header.displayTemplate = (_value: string, row: RowData<T>) =>
        elementWithRef(
          row.rowIndex,
          editProps.iconButtonProps ? (
            <IconButtonColumn
              {...editProps.iconButtonProps}
              row={dataRef.current[row.rowIndex]}
              iconButtonProps={{
                ...iconButtonProps,
                onClick: () => iconButtonProps.onClick(dataRef.current[row.rowIndex])
              }}
            />
          ) : null
        )
    } else if (editType === 'radioMenu' && editProps.radioMenuProps) {
      const {
        radioMenuProps: { options, onChange, applyToAllProps, ...radioMenuProps }
      } = editProps

      const applyProps = applyToAllProps
        ? {
            ...applyToAllProps,
            applied: selectApplyAll[header.accessor as string]
          }
        : undefined

      header.displayTemplate = (value: Option, row: RowData<T>) =>
        elementWithRef(
          row.rowIndex,
          <RadioMenuColumn
            {...radioMenuProps}
            row={row}
            value={value}
            options={options}
            applyToAllProps={applyProps}
            accessor={header.accessor as string}
            handleChange={(selected: Option, applyAllRows: boolean) => {
              if (applyAllRows) {
                _.forEach(tableData, (row) => _.set(row, header.accessor as string, selected))
                setSelectApplyAll({ [header.accessor as string]: applyAllRows })
              } else if (
                selectApplyAll[header.accessor as string] &&
                !_.isEqual(applyAllRows, selectApplyAll[header.accessor as string])
              ) {
                setSelectApplyAll({ [header.accessor as string]: applyAllRows })
              }

              onChange(selected, dataRef.current[row.rowIndex], applyAllRows)
            }}
          />
        )
    } else if (header.displayTemplate && header.editProps?.editType !== 'custom') {
      const template = header.displayTemplate
      header.displayTemplate = (v, row: RowData<T>) => {
        if (row.rowIndex >= dataRef.current.length) {
          return
        }
        return elementWithRef(
          row.rowIndex,
          <DisplayTemplateColumn
            tableData={tableData || []}
            row={dataRef.current[row.rowIndex]}
            template={template}
            value={v}
          />
        )
      }
    }

    if (editable && (header.editProps || header.displayTemplate)) {
      // This is for EDITABLE table only. Overriding sort type callback function with current table data for edit related columns
      const _sortType = header.sortType
      if (_sortType) {
        if (_.isFunction(_sortType)) {
          header.sortType = (a: any, b: any) =>
            _sortType(
              { ...a, original: dataRef.current[a.original.rowIndex] },
              { ...b, original: dataRef.current[b.original.rowIndex] }
            )
        }
      } else {
        header.sortType = (a: any, b: any) => {
          return (
            _.get(dataRef.current[a.original.rowIndex], header.id ?? '') -
            _.get(dataRef.current[b.original.rowIndex], header.id ?? '')
          )
        }
      }
    }
  }

  const formatHeader = useCallback((header: HeaderType<T>) => {
    switch (header.displayType) {
      case 'boolean':
        return configureBooleanColumn(header)
      case 'link':
        return configureLinkColumn(header)
      case 'chip':
        return configureBadgeColumn(header)
      case 'flag':
        return configureFlagColumn(header)
      default:
        return header
    }
  }, [])

  useEffect(() => {
    const filtersWithOptions: Filter[] = []
    const filterColumns = headers.filter((h) => h.filterable)
    const _existingFilters = existingFilters || (_.get(appSessionData, `${fasteStoreKey}.filters`) as SelectedFilter)

    filterColumns.forEach((column) => {
      const stateSelectedOptions = filterList?.find((f) => f.category === (column.accessor as string))?.selectedOptions
      const sessionSelectedOptions = _existingFilters?.[column.accessor as string]
      filtersWithOptions.push({
        category: column.accessor as string,
        title: column.header,
        options: _.uniq(props.data.map((row: T) => _.get(row, column.accessor as string)) as string[]),
        selectedOptions: stateSelectedOptions || sessionSelectedOptions || []
      })
    })
    const _filterList = filtersWithOptions.filter((f) => f.options.length > 1)
    if (_filterList.length) {
      setFilterList(_filterList)
    }
    setFlaggedCols(headers.some((h) => h.displayType === 'flag'))
  }, [existingFilters, fasteStoreKey, props.data, headers, appSessionData])

  const getFilterBar = () => {
    if (filterBar) {
      return { filterBar }
    }
    if (filterList.length || flaggedCols) {
      return {
        filterBar: (
          <FilterBar
            filterList={filterList}
            applyFilters={(selectedFilters) => {
              const updatedFilterList = _.cloneDeep(filterList)
              updatedFilterList.forEach((f) => {
                f.selectedOptions = selectedFilters[f.category] || f.selectedOptions
              })
              setFilterList(updatedFilterList)
              if (fasteStoreKey) {
                const sessionData = _.get(appSessionData, `${fasteStoreKey}`)
                upsertAppSessionData(fasteStoreKey, {
                  filters: { ...(sessionData?.filters || {}), ...selectedFilters }
                })
              }
            }}
            {...(flaggedCols && { trailingContent: <FlagLabel /> })}
          />
        )
      }
    }
    return {}
  }

  const setIdForSort = useCallback((h: HeaderType<T>) => {
    if (!h.id && _.isString(h.accessor)) {
      h.id = h.accessor
    }
  }, [])

  useEffect(() => {
    if (editable) {
      const refs: CellRefs = Array(data.length).fill([])
      const _headers = _.cloneDeep(props.headers)
      setHeaders(
        _headers.map((header: HeaderType<T>) => {
          if (editable) {
            updateHeaderForEdit(header, refs)
          }

          setIdForSort(header)
          return header
        })
      )
      setCellRefs(refs)
    }
  }, [tableData, editable, selectApplyAll, tableRef.current])

  useEffect(() => {
    if (!editable) {
      const _headers = _.cloneDeep(props.headers).map((h) => {
        setIdForSort(h)
        return formatHeader(h)
      })
      setHeaders(_headers)
    }
  }, [editable, formatHeader, props.headers, setIdForSort])

  useEffect(() => {
    if (!renderTable && dynamicWidthHeaders && tableRef.current) {
      // For headers with widthPercentage we wait until tableRef.current is available before rendering.
      setRenderTable(true)
    }
  }, [dynamicWidthHeaders, renderTable])

  let leadingContent: ReactNode = null
  if (customTopBar) {
    leadingContent = customTopBar
  } else if (props.title) {
    leadingContent = (
      <TableTopBar
        title={title}
        {...getFilterBar()}
        actions={
          <>
            {searchable && (
              <Textfield
                className={styles['search']}
                variant='embedded'
                leadingIcon='search'
                defaultValue={searchTerm}
                label={t('common.search.label')}
                dense
                onChange={(e: any) => {
                  const searchTerm = e.target.value
                  setSearchTerm(searchTerm)
                  if (fasteStoreKey) {
                    upsertAppSessionData(fasteStoreKey, { searchTerm })
                  }
                }}
                trailingIcon={
                  searchTerm ? (
                    <IconButton
                      onClick={() => {
                        setSearchTerm('')
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
            {enableCsvDownload && (
              <div className={styles.csv_downloader}>
                <IconButton
                  disabled={!data?.length}
                  onClick={() => {
                    downloadXlsx(
                      getCSVColumns(headers) as { displayName: string; id: string }[],
                      getDownloadableData(data) as unknown as Datas,
                      csvFileName || 'CSV_DATA'
                    )
                  }}
                >
                  <Icon icon='file_download' />
                </IconButton>
              </div>
            )}
          </>
        }
      />
    )
  }

  const getDownloadableData = (data: RowData<T>[]) => {
    const result = getDisplayTableData(data).map((row) => {
      if (row?.subRows) return [row, ...row.subRows]
      else return [row]
    })
    return _.flatten(result)
  }

  const getDisplayTableData = useCallback(
    (data: RowData<T>[]) => {
      const filteredRows = getFilteredData<RowData<T>>(filterList, data)
      if (searchable && searchTerm !== '') {
        const lowerCaseSearchTerm = searchTerm.toLowerCase()
        let customSearchResult: RowData<T>[] = [],
          searchKeysResult: RowData<T>[] = []
        const searchKeys = headers.filter((h) => h.searchable).map((h) => h.accessor as string)
        if (searchKeys.length) {
          searchKeysResult = fuzzySearch(lowerCaseSearchTerm, filteredRows as any, searchKeys) as any
        }
        if (customSearchFn) {
          customSearchResult = filteredRows.filter((data) => customSearchFn(data, lowerCaseSearchTerm))
        }
        // Union is required here, in case consumer of the Table wants to do both searchable columns and custom search function!!
        return _.uniq([...customSearchResult, ...searchKeysResult])
      } else {
        return filteredRows
      }
    },
    [customSearchFn, filterList, headers, searchTerm, searchable]
  )

  const onStateChange = useCallback(
    (state: any) => {
      if (!_.isEqual(state.sortBy, sortBy) && state.sortBy.length > 0) {
        if (fasteStoreKey) {
          upsertAppSessionData(fasteStoreKey, { sortBy: [...state.sortBy] })
          _.set(appSessionData, `${fasteStoreKey}.sortBy`, state.sortBy)
        }
        setSortBy(state.sortBy)
      }
    },
    [appSessionData, fasteStoreKey, sortBy, upsertAppSessionData]
  )

  const applySortOrderAndWidth = useCallback(
    (headers: HeaderType<T>[]) => {
      if (!sortBy && !dynamicWidthHeaders) {
        return headers
      }

      const finalSortBy =
        sortBy?.reduce((acc, cur) => {
          acc[cur.id] = cur
          return acc
        }, {} as any) || {}

      const updatedHeaders = headers.map((header: HeaderType<T>) => {
        const id = header.id || ''
        if (dynamicWidthHeaders) {
          const totalWidth = tableRef.current?.offsetWidth || 0
          if (totalWidth > 0 && header.widthPercentage) {
            header.width = Math.round(totalWidth * (header.widthPercentage / 100))
          }
        }

        if (finalSortBy[id]) {
          return {
            ...header,
            defaultSort: finalSortBy[id]?.desc ? 'desc' : 'asc',
            defaultSortOrder: finalSortBy[id]?.order
          }
        }

        return { ...header, defaultSort: undefined }
      })
      return updatedHeaders
    },
    [dynamicWidthHeaders, sortBy]
  )

  const tableElement = (
    <ElementTable
      className={`${styles.table_container} ${props.noBorder ? styles.no_border : ''}`}
      {...tableProps}
      data={getDisplayTableData(editable ? tableData : data)}
      {...expandedProps}
      {...paginationProps}
      fullWidth
      columns={[
        ...(expandedProps.expandable
          ? [
            {
              id: 'expander',
              cellTemplate: expanderCellTemplate,
              ...(dynamicWidthHeaders ? { width: 64 } : {})
            }
          ]
          : []),
        ...applySortOrderAndWidth(headers)
      ]}
      layout={layout}
      sortable
      onStateChange={onStateChange}
      noContentIncludeTable={true}
      {...(editable && footerContent
        ? { footerContent: <FooterWithRef ref={footerRef} template={props.footerContent} /> }
        : { footerContent })}
      {...(leadingContent
        ? {
          leadingContent:
            editable && props.customTopBar ? (
              <LeadingContentWithRef ref={leadingContentRef} template={props.customTopBar} />
            ) : (
              leadingContent
            )
        }
        : {})}
    />
  )

  // useMemo have custom dependency as we want to rerender editable table only when headers/table data changes!
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedTableElement = useMemo(() => tableElement, [headers, tableData])
  const table = props.editable ? memoizedTableElement : tableElement

  return dynamicWidthHeaders ? (
    <div data-testid='dynamicWidthTable' style={{ width: '100%' }} ref={tableRef}>
      {renderTable && table}
    </div>
  ) : (
    table
  )
}

export default Table
