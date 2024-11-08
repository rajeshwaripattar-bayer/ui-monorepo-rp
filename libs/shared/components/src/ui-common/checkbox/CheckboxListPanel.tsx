import _ from 'lodash'
import styles from './CheckboxListPanel.module.scss'
import { TypoSubtitle, TypoCaption } from '@element/react-typography'
import { Switch } from '@element/react-switch'
import { List, ListItem } from '@element/react-list'
import { Checkbox } from '@element/react-checkbox'
import { useTranslation } from 'react-i18next'
import { useMemo, useState, useEffect, ReactNode } from 'react'
import { ExpansionPanel, ExpansionIcon, ExpansionTrigger, ExpansionContent } from '@element/react-expansion-panel'

export interface CheckboxListPanelProps {
  title?: string
  category: string
  checkBoxListProps: {
    itemList: string[]
    selectedItems: string[]
    themeColor?: string
  }
  onChange: (category: string, selectedOptions: string[]) => void
  switchProps?: {
    label?: string
    hideLabel?: boolean
    themeColor?: string
  }
  enableSelectAll?: boolean
  enableExpansion?: boolean
}

export function CheckboxListPanel({
  title,
  category,
  switchProps,
  checkBoxListProps,
  enableExpansion,
  enableSelectAll,
  onChange
}: Readonly<CheckboxListPanelProps>) {
  const { t } = useTranslation()
  const [selectAll, setSelectAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState(checkBoxListProps.selectedItems)

  const selectAllText = t('common.select_all.label') || 'Select All'
  const items = useMemo(() => checkBoxListProps.itemList, [checkBoxListProps.itemList])

  const checkItem = (item: string) => {
    const hasItem = selectedItems?.includes(item)
    const newSelectedItems = hasItem
      ? selectedItems.filter((x: string) => x !== item)
      : selectedItems
        ? [...selectedItems, item]
        : []

    setSelectAll(hasItem ? false : newSelectedItems.length === items.length)
    onChange(category, newSelectedItems)
    setSelectedItems(newSelectedItems)
  }

  const handleSelectAll = (isAllSelected: boolean) => {
    setSelectAll(isAllSelected)
    if (isAllSelected) {
      onChange(category, items)
      setSelectedItems(items)
    } else {
      onChange(category, [])
      setSelectedItems([])
    }
  }

  const renderExpansionPanel = (children: ReactNode) => {
    return (
      <ExpansionPanel style={{ width: '100px' }}>
        <ExpansionTrigger expansionId={category}>
          <ListItem
            trailingBlock={<ExpansionIcon expansionId={category} />}
            trailingBlockType='icon'
            nonInteractive
            noHover
          >
            {title?.toUpperCase() ?? category.toUpperCase()}
          </ListItem>
        </ExpansionTrigger>
        <ExpansionContent expansionId={category}>{children}</ExpansionContent>
      </ExpansionPanel>
    )
  }

  const renderFilterPanel = (checkboxList: ReactNode) => {
    return enableExpansion ? renderExpansionPanel(checkboxList) : checkboxList
  }

  useEffect(() => {
    setSelectAll(
      checkBoxListProps.selectedItems && checkBoxListProps.itemList.length === checkBoxListProps.selectedItems.length
    )
  }, [checkBoxListProps.itemList, checkBoxListProps.selectedItems])

  useEffect(() => {
    setSelectedItems(checkBoxListProps.selectedItems)
  }, [checkBoxListProps.selectedItems])

  return (
    <div className={styles.checkboxListFilterPanelContainer}>
      {!_.isEmpty(title) && !enableExpansion && (
        <div className={styles.title} data-testid='title'>
          <TypoSubtitle level={2}>{title}</TypoSubtitle>
        </div>
      )}

      {enableSelectAll && (
        <div className={styles.optionsHeader}>
          <TypoCaption className={styles['headerText']}>{selectAllText} </TypoCaption>
          <Switch
            checked={selectAll}
            label={switchProps?.label ?? ''}
            hideLabel={!!switchProps?.label && !!switchProps?.hideLabel}
            themeColor={switchProps?.themeColor ?? 'primary'}
            onChange={handleSelectAll}
            data-testid='select-all-switch'
          />
        </div>
      )}

      <List>
        {renderFilterPanel(
          <>
            {items.map((item: string) => (
              <ListItem key={`lmnt-${item}`} onClick={() => checkItem(item)}>
                <Checkbox
                  checked={selectedItems?.includes(item)}
                  label={item}
                  themeColor={checkBoxListProps.themeColor ?? 'primary'}
                  data-testid={`checkbox-${item}`}
                />
              </ListItem>
            ))}
          </>
        )}
      </List>
    </div>
  )
}

export default CheckboxListPanel
