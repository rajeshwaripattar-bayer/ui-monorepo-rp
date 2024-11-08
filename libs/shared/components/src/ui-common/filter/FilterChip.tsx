import _ from 'lodash'
import styles from './FilterChip.module.scss'
import { Chip } from '@element/react-chips'
import { Icon } from '@element/react-icon'
import { Menu } from '@element/react-menu'
import { useState, useEffect, useCallback, ReactNode } from 'react'
import { TypoSubtitle, TypoCaption } from '@element/react-typography'
import { IconButton } from '@element/react-icon-button'
import CheckboxListPanel from '../checkbox/CheckboxListPanel'
import { Button } from '@element/react-button'
import { Filter, SelectedFilter } from '@gc/types'
import { useTranslation } from 'react-i18next'
import BottomSheet from '../bottom-sheet/BottomSheet'
import { IS_MOBILE, IS_DESKTOP, resolutions } from '@gc/constants'
import MediaQuery from 'react-responsive'
import { useScreenRes } from '@gc/hooks'
import { Switch } from '@element/react-switch'
import { ListItem } from '@element/react-list'

/* eslint-disable-next-line */

const BG_COLOR = 'rgba(0, 108, 103, 0.3)'
const FONT_COLOR = 'rgba(0, 108, 103, 1)'

export interface FilterChipProps {
  chipLabel: string
  isAllFilters: boolean
  expansionForAllFilters?: boolean
  filterList: Array<Filter>
  leadingIcon?: string
  trailingIcon?: string
  applyFilters: (appliedFilters: SelectedFilter) => void
  style?: object
  enableSelectAll?: boolean
}

export function FilterChip(props: FilterChipProps) {
  const { t } = useTranslation()

  const getAppliedFilters = useCallback(
    () =>
      props.filterList.reduce((acc: SelectedFilter, filter) => {
        acc[filter.category] = filter.selectedOptions
        return acc
      }, {}),
    [props.filterList]
  )

  const [open, setOpen] = useState(false)
  const [chipLabel, setChipLabel] = useState<string | ReactNode>(props.chipLabel)
  const [chipBgColor, setChipBgColor] = useState('')
  const [chipFontColor, setChipFontColor] = useState(props.isAllFilters ? FONT_COLOR : '')
  const [chipTrailingIcon, setChipTrailingIcon] = useState(props.trailingIcon)
  const [appliedFilters, setAppliedFilters] = useState<SelectedFilter>(getAppliedFilters())
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilter>(getAppliedFilters())

  const res = useScreenRes()

  useEffect(() => {
    // This effect is used to sync the appliedFilters and selectedFilters with the props.filterList
    const _appliedFilters = getAppliedFilters()
    if (!_.isEqual(appliedFilters, _appliedFilters)) {
      setAppliedFilters(_appliedFilters)
      setSelectedFilters(_appliedFilters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAppliedFilters])

  useEffect(() => {
    const filterCount = Object.values(appliedFilters).filter((v) => !_.isEmpty(v)).length
    let label: string | ReactNode = props.chipLabel
    if (filterCount > 0) {
      if (props.isAllFilters) {
        label = (
          <span>
            {props.chipLabel}
            <span style={{ marginLeft: '4px' }}>({filterCount})</span>
          </span>
        )
      } else {
        const selectedValues = Object.values(appliedFilters)[0]
        label = (
          <span>
            {selectedValues[0]}
            {selectedValues.length > 1 && <span style={{ marginLeft: '4px' }}>+{selectedValues.length - 1}</span>}
          </span>
        )
        setChipBgColor(BG_COLOR)
        setChipTrailingIcon('close')
        setChipFontColor(FONT_COLOR)
      }
    } else {
      setChipBgColor('')
      setChipTrailingIcon(props.isAllFilters ? '' : 'arrow_drop_down')
      setChipFontColor(props.isAllFilters ? FONT_COLOR : '')
    }
    setChipLabel(label)
  }, [appliedFilters, props.chipLabel, props.isAllFilters])

  const clearFocus = () => {
    const chip = document.activeElement as HTMLElement
    if (chip) chip.blur()
  }

  const clearAllFilters = useCallback(() => {
    const clearedFilters = { ...appliedFilters }
    Object.keys(clearedFilters).forEach((key) => (clearedFilters[key] = []))
    setSelectedFilters(clearedFilters)
    return clearedFilters
  }, [appliedFilters])

  const closeFilter = useCallback(
    (fromUserAction?: boolean) => {
      setOpen(false)
      const filterCount = Object.values(appliedFilters).filter((v) => !_.isEmpty(v)).length
      if (filterCount === 0 || props.isAllFilters) {
        setChipBgColor('')
      }
      if (filterCount === 0 && !fromUserAction) {
        clearAllFilters()
      }
      clearFocus()
    },
    [appliedFilters, clearAllFilters, props.isAllFilters]
  )
  closeFilter.toString = () => 'closeFilter'

  const handleCloseFilter = useCallback(() => {
    closeFilter(false)
    setSelectedFilters(getAppliedFilters())
  }, [closeFilter, getAppliedFilters])

  const handleChipClick = () => {
    setOpen(true)
    setChipBgColor(BG_COLOR)
  }

  const handleFilterChange = (category: string, updatedValues: string[]) => {
    const newFilters = { ...selectedFilters, [category]: updatedValues }
    setSelectedFilters(newFilters)
  }

  const handleSwitchSelection = (category: string, checked: boolean, options: string[]) => {
    const newFilters = { ...selectedFilters, [category]: checked ? [options[0]] : [] }
    setSelectedFilters(newFilters)
  }

  const handleClearFromChip = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    const clearedFilters = clearAllFilters()
    setAppliedFilters(clearedFilters)
    props.applyFilters(clearedFilters)
    clearFocus()
  }

  const noFiltersSelected = Object.values(selectedFilters).every((v) => _.isEmpty(v))

  const leadingIcon = () =>
    props.leadingIcon && <Icon icon={props.leadingIcon} iconSize='small' style={{ marginRight: '4px' }} />
  const trailingIcon = () =>
    chipTrailingIcon && (
      <Icon
        icon={chipTrailingIcon}
        iconSize={chipTrailingIcon === 'close' ? 'medium' : 'small'}
        {...(chipTrailingIcon === 'close' ? { onClick: handleClearFromChip } : {})}
        style={{ marginLeft: '4px' }}
      />
    )

  const chipStyles = {
    ...props.style,
    color: chipFontColor,
    backgroundColor: chipBgColor,
    verticalAlign: 'middle',
    lineHeight: '16px',
    padding: '0px 10px'
  }

  const filterContent = (
    <>
      {props.filterList.map(({ category, title, options, filterType, switchLabel }) => {
        if (filterType === 'switch') {
          return (
            <div key={category} className={styles.filter_switch}>
              {props.isAllFilters && (
                <ListItem nonInteractive noHover>
                  {title?.toUpperCase() || category.toUpperCase()}
                </ListItem>
              )}
              <Switch
                checked={_.isEqual(selectedFilters[category], options)}
                label={switchLabel || ''}
                onChange={(val: boolean) => handleSwitchSelection(category, val, options)}
                data-testid='filter-switch'
              />
            </div>
          )
        }
        return (
          <div key={category} className={styles.checkbox_list}>
            <CheckboxListPanel
              key={category}
              enableExpansion={props.isAllFilters && props.expansionForAllFilters}
              title={props.isAllFilters ? title : ''}
              category={category}
              checkBoxListProps={{
                itemList: options,
                selectedItems: selectedFilters[category]
              }}
              onChange={handleFilterChange}
              enableSelectAll={props.enableSelectAll}
            />
          </div>
        )
      })}
    </>
  )

  const footerContent = () => {
    const isMobile = res <= resolutions.M839
    let buttonProps = {
      buttonSize: 'xsmall',
      fullWidth: false
    }

    if (isMobile) {
      buttonProps = {
        buttonSize: 'medium',
        fullWidth: true
      }
    }

    const clearAction = (
      <Button
        key='clear'
        variant={isMobile ? 'outlined' : 'text'}
        {...buttonProps}
        disabled={noFiltersSelected}
        onClick={clearAllFilters}
        label={t('common.clear.label') || 'Clear'}
      />
    )
    const applyAction = (
      <Button
        key='apply'
        variant={isMobile ? 'filled' : 'text'}
        {...buttonProps}
        label={t('common.apply.label') || 'Apply'}
        disabled={_.isEqual(getAppliedFilters(), selectedFilters)}
        onClick={() => {
          setAppliedFilters(selectedFilters)
          props.applyFilters(selectedFilters)
          closeFilter(true)
        }}
        {...(isMobile ? { style: { marginBottom: '8px' } } : {})}
      />
    )

    const actions = isMobile ? [applyAction, clearAction] : [clearAction, applyAction]
    return actions.map((a) => a)
  }

  return (
    <div className={styles.filter}>
      <Chip
        data-testid={props.chipLabel}
        labelRenderer={() => (
          <TypoCaption style={{ fontWeight: props.isAllFilters ? 700 : 400 }}>{chipLabel}</TypoCaption>
        )}
        variant='outlined'
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon}
        onClick={handleChipClick}
        style={chipStyles}
        input
        initiallySelected={false}
        selected={false}
        chipData={{}}
      />
      <MediaQuery maxWidth={IS_MOBILE}>
        <BottomSheet
          data-testid='filter-bottom-sheet'
          title={props.chipLabel}
          className={styles.bottom_sheet}
          open={open}
          onClose={handleCloseFilter}
          detent='content-height'
          content={filterContent}
          contentScrollable
          footer={<div className={styles.footer_bottom_sheet}>{footerContent()}</div>}
        />
      </MediaQuery>
      <MediaQuery minWidth={IS_DESKTOP}>
        {open && (
          <Menu
            data-testid='filter-menu'
            open={open}
            surfaceOnly
            onClose={handleCloseFilter}
            className={styles.container}
          >
            <div className={styles.header}>
              <IconButton className={styles.close_icon} icon='close' iconSize='medium' onClick={handleCloseFilter} />
              <TypoSubtitle level={2} style={{ paddingTop: '10px' }}>
                {props.chipLabel}
              </TypoSubtitle>
            </div>
            <div className={styles.content}>{filterContent}</div>
            <div className={styles.footer_menu}>{footerContent()}</div>
          </Menu>
        )}
      </MediaQuery>
    </div>
  )
}

export default FilterChip
