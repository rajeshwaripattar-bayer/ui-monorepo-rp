import styles from './SelectColumn.module.scss'
import React, { useState, useEffect, useImperativeHandle } from 'react'
import { Select, SelectOption, SelectProps } from '@element/react-select'
import { TypoCaption } from '@element/react-typography'
import { Switch } from '@element/react-switch'
import { refWrapper, RowData, DataUpdateHandle } from '../RefWrapper'
import _ from 'lodash'

/* eslint-disable-next-line */
export interface SelectColumnProps extends SelectProps {
  handleChange: (obj: { value: string; text: string }, applyAllRows: boolean) => void
  value: string | { value: string; text: string }
  options: Array<{ value: string; text: string }>
  applyToAllProps?: {
    label: string
    applied: boolean
  }
  row: RowData
  accessor: string
}

const SelectColumn = (props: SelectColumnProps, ref: React.ForwardedRef<DataUpdateHandle>) => {
  const { accessor, value, handleChange, applyToAllProps, row, options: defaultOptions, ...selectProps } = props
  const [checked, setChecked] = useState(!!applyToAllProps?.applied)
  const [options, setOptions] = useState<Array<{ value: string; text: string }>>(defaultOptions)
  const [selectedValue, setSelectedValue] = useState(
    (value && typeof value === 'object' ? value.value : value) || (!_.isEmpty(options) && options[0].value)
  )

  useEffect(() => {
    setChecked(!!applyToAllProps?.applied)
  }, [applyToAllProps?.applied])

  useImperativeHandle(ref, () => ({
    updateMatchingData: (updatedRows: RowData[]) => {
      const matching: RowData = updatedRows[row.rowIndex]
      if (matching) {
        const newValue = _.get(matching, accessor)
        const selected =
          (newValue && typeof newValue === 'object' ? newValue.value : value) ||
          (!_.isEmpty(options) && options[0].value)
        setSelectedValue(selected)
      }
    },
    updateProps(newProps) {
      const selectProps = newProps as SelectColumnProps
      if (!_.isEqual(selectProps.options, options)) {
        setOptions(selectProps.options)
      }
    }
  }))

  let selectOptions = applyToAllProps
    ? [
        <SelectOption key='switch-select-item' className={styles.leading_section} isSelected={false}>
          <div className={styles.select_all_item}>
            <TypoCaption>{applyToAllProps?.label || ''}</TypoCaption>
            <span className={styles.switch}>
              <Switch
                style={{ marginLeft: 'auto' }}
                checked={checked}
                label={''}
                themeColor={'primary'}
                data-testid='select-all-switch'
                onChange={(val: boolean) => {
                  setChecked(val)
                }}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              />
            </span>
          </div>
        </SelectOption>
      ]
    : []

  selectOptions = selectOptions.concat(
    options.map((option) => (
      <SelectOption key={option.value} value={option.value}>
        {option.text}
      </SelectOption>
    ))
  )

  return (
    <Select
      variant='outlined'
      {...selectProps}
      value={options.find((l) => l.value === selectedValue)}
      hoisted
      style={{ width: '300px', alignContent: 'center', backgroundColor: 'white' }}
      onChange={(obj: { value: string; text: string }) => {
        setSelectedValue(obj.value)
        handleChange(obj, checked)
      }}
    >
      {selectOptions}
    </Select>
  )
}
// Note - Element Select have an issue when we try to use valueKey/textKey with <SelectOption> its unable to render options.

export default refWrapper<SelectColumnProps>(SelectColumn)
