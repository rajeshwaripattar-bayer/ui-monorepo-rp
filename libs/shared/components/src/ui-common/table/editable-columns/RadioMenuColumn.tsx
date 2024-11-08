import { Button } from '@element/react-button'
import { List, ListItem } from '@element/react-list'
import { Menu } from '@element/react-menu'
import { Radio } from '@element/react-radio'
import { ApplyAllProps, Option } from '@gc/components/types'
import { noop } from 'lodash'
import get from 'lodash/get'
import isUndefined from 'lodash/isUndefined'
import map from 'lodash/map'
import { useEffect, useImperativeHandle, useMemo, useState } from 'react'
import isEqual from 'react-fast-compare'
import { useTranslation } from 'react-i18next'
import SelectAllSwitch from '../../switch/SelectAllSwitch'
import { DataUpdateHandle, RowData, refWrapper } from '../RefWrapper'
import styles from './RadioMenuColumn.module.scss'
import { useResetState } from '@gc/hooks'

export interface RadioMenuColumnProps {
  row: RowData
  value: Option
  accessor: string
  options: Array<Option>
  applyToAllProps?: ApplyAllProps
  handleChange: (obj: Option, applyAllRows: boolean) => void
}

function ButtonContainer({
  onApply,
  onClose,
  disabled = false
}: Readonly<{ onClose: Function; onApply: Function; disabled?: boolean }>) {
  const { t } = useTranslation()

  return (
    <div className={styles.button_container}>
      <Button fullWidth={false} variant='text' buttonSize='xsmall' onClick={onClose} label={t('common.cancel.label')} />
      <Button
        fullWidth={false}
        buttonSize='xsmall'
        variant='text'
        onClick={onApply}
        disabled={disabled}
        label={t('common.apply.label')}
      />
    </div>
  )
}

function RadioMenuColumn(
  { row, accessor, value, applyToAllProps, handleChange, options: defaultOptions }: RadioMenuColumnProps,
  ref: React.ForwardedRef<DataUpdateHandle>
) {
  const applied = applyToAllProps?.applied ?? false

  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState(defaultOptions)
  const [checked, setChecked, resetChecked] = useResetState(applied)
  const [currentValue, setCurrentValue] = useState(value)
  const [selectedItem, setSelectedItem, resetSelectedItem] = useResetState(value)

  const setMenuState = (isOpen?: boolean) => setOpen(isOpen ?? !open)
  const handleClose = () => {
    setMenuState(false)
    resetSelectedItem()
    resetChecked()
  }
  const handleApply = () => {
    handleChange(selectedItem, checked)
    setCurrentValue(selectedItem)
    setMenuState(false)
  }

  const radioItems = useMemo(
    () =>
      map(options, (option) => {
        // This is a workaround to ensure that the input value is unique for each option.
        // If the input value is not unique, only the last radio option will be displayed as selected.
        const inputVal = option.value + row.rowIndex
        const isSelectedAndChecked = selectedItem.value === option.value

        return (
          <ListItem
            key={option.value}
            name={option.value}
            selected={isSelectedAndChecked}
            onClick={() => setSelectedItem(option)}
          >
            <Radio name={inputVal} value={inputVal} label={option.text} checked={isSelectedAndChecked} />
          </ListItem>
        )
      }),
    [options, row, selectedItem]
  )

  useEffect(() => {
    setChecked(applied)
  }, [applied])

  useImperativeHandle(ref, () => ({
    updateMatchingData: (updatedRows: RowData[]) => {
      const matching: RowData = updatedRows[row.rowIndex]
      if (isUndefined(matching)) return

      const newValue = get(matching, accessor) as Option
      if (!isEqual(newValue?.value, selectedItem.value)) {
        setSelectedItem(newValue)
        setCurrentValue(newValue)
      }
    },
    updateProps(newProps) {
      const itemMenuProps = newProps as RadioMenuColumnProps | undefined
      if (!isUndefined(itemMenuProps) && !isEqual(itemMenuProps?.options, options)) {
        setOptions(itemMenuProps.options)
      }
    }
  }))

  return (
    <Menu
      surfaceOnly
      hoistToBody
      open={open}
      handleBodyClick={() => noop()}
      trigger={
        <Button variant='outlined' onClick={() => setMenuState(true)}>
          {currentValue.text}
        </Button>
      }
    >
      <div className={styles.menu_container}>
        <SelectAllSwitch checked={checked} setChecked={setChecked} label={applyToAllProps?.label} />
        <List showDivider={false}>{radioItems}</List>
        <ButtonContainer onClose={handleClose} onApply={handleApply} />
      </div>
    </Menu>
  )
}

export default refWrapper<RadioMenuColumnProps>(RadioMenuColumn)
