import styles from './FilterBar.module.scss'
import FilterChip from './FilterChip'
import { Filter, SelectedFilter } from '@gc/types'
import { useTranslation } from 'react-i18next'
import React, { ReactNode } from 'react'

export interface FilterBarProps {
  filterList: Filter[]
  applyFilters: (selectedFilters: SelectedFilter) => void
  containerClassName?: string
  expansionForAllFilters?: boolean
  trailingContent?: ReactNode
}

export function FilterBar(props: FilterBarProps) {
  const { t } = useTranslation()

  return (
    <div className={`${styles.container} ${props.containerClassName}`}>
      <div className={styles.filters}>
        {props.filterList.length > 1 && (
          <FilterChip
            key='all'
            chipLabel={t('common.all_filters.label') || 'All Filters'}
            isAllFilters={true}
            expansionForAllFilters={props.expansionForAllFilters}
            filterList={props.filterList}
            leadingIcon='tune'
            applyFilters={props.applyFilters}
            style={{ marginRight: '16px', color: 'rgba(0, 108, 103, 1)' }}
          />
        )}
        {props.filterList.map((filter, i) => (
          <FilterChip
            key={filter.category}
            chipLabel={filter.title}
            isAllFilters={false}
            filterList={[props.filterList[i]]}
            trailingIcon='arrow_drop_down'
            applyFilters={props.applyFilters}
            style={{ marginRight: '4px' }}
          />
        ))}
      </div>
      {props.trailingContent}
    </div>
  )
}

export default FilterBar
