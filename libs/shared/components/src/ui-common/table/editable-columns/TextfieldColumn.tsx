import _ from 'lodash'
import styles from './TextfieldColumn.module.scss'
import React, { useImperativeHandle, useState } from 'react'
import { Textfield, TextfieldProps } from '@element/react-textfield'
import { getDecimalValue } from '@gc/utils'
import { refWrapper, RowData, DataUpdateHandle } from '../RefWrapper'

export interface TextfieldColumnProps extends TextfieldProps {
  value: string | number
  isWholeNumber?: boolean
  decimalPlaces?: number
  row: RowData
  accessor: string
  max?: number
  onWheel?: (e: React.WheelEvent<HTMLElement>) => void
}

function getTransformedValue(value: number | string, decimalPlaces?: number) {
  const stringValue = value?.toString()
  return decimalPlaces ? getDecimalValue(stringValue, decimalPlaces) : stringValue
}

const TextfieldColumn = (props: TextfieldColumnProps, ref: React.ForwardedRef<DataUpdateHandle>) => {
  const { onChange, onBlur, isWholeNumber, decimalPlaces, row, accessor, ...textfieldProps } = props
  const [value, setValue] = useState<string>(getTransformedValue(props.value, props.decimalPlaces))
  const [inFocus, setInFocus] = useState(false)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    const regex = isWholeNumber ? /[0-9]/ : /^\d*\.?\d*$/
    return regex.test(e.key) || e.preventDefault()
  }

  useImperativeHandle(ref, () => ({
    updateMatchingData: (updatedRows: RowData[]) => {
      const matching: RowData = updatedRows[row.rowIndex]
      if (matching) {
        const newValue = _.get(matching, accessor)
        const formattedValue = getTransformedValue(newValue, props.decimalPlaces)
        if (value !== formattedValue) {
          setValue(!inFocus ? formattedValue : _.get(matching, accessor))
        }
      }
    }
  }))

  return (
    <Textfield
      variant='outlined'
      dense={true}
      {...textfieldProps}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value
        if (decimalPlaces) {
          const decimalIndex = value.indexOf('.')
          if (decimalIndex !== -1 && value.substring(decimalIndex + 1).length > decimalPlaces) {
            value = value.slice(0, decimalIndex + decimalPlaces + 1)
          }
        }
        setValue(value)
        onChange && onChange(value)
      }}
      onFocus={() => setInFocus(true)}
      onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value
        // If the max is set and the value is greater than the max, set the value to the max
        if (props.max && Number(value) > props.max) {
          value = props.max.toString()
        }
        if (props.decimalPlaces) {
          setValue(getDecimalValue(value, decimalPlaces || 0))
        }
        onBlur && onBlur(value)
        setInFocus(false)
      }}
      containerProps={{ className: styles.textfield }}
      {...(isWholeNumber || decimalPlaces
        ? {
            onKeyPress: handleKeyPress,
            min: 0,
            step: isWholeNumber ? '1' : '0.01'
          }
        : {})}
    />
  )
}

export default refWrapper<TextfieldColumnProps>(TextfieldColumn)
