import { Radio } from '@element/react-radio'
import { Select } from '@element/react-select'
import { Textfield } from '@element/react-textfield'
import React from 'react'

type Option = {
  value: string
  displayName?: string
  text?: string
}

type InputFieldsProps = {
  field: string
  type?: string
  label?: string
  variant?: string
  value?: string
  options?: Option[]
  disabled?: boolean
  autoFocus?: boolean
  isValid?: boolean
  validationMessage?: string
  onChangeHandler: (key: string, value: string) => void
}

export const InputFields = (props: InputFieldsProps) => {
  const renderTextField = ({
    field,
    type = 'text',
    label = '',
    variant = 'outlined',
    value = '',
    disabled = false,
    autoFocus = false,
    isValid = true,
    validationMessage = '',
    onChangeHandler
  }: InputFieldsProps) => {
    return (
      <Textfield
        label={label}
        variant={variant}
        fullWidth={true}
        type={type}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        valid={isValid}
        helperText={validationMessage || ''}
        helperTextValidation
        onChange={(event) => onChangeHandler(field, (event.target as HTMLInputElement).value)}
      />
    )
  }

  const renderRadioButtons = ({ field, value = '', options = [], onChangeHandler }: InputFieldsProps) => {
    return options.map((option) => {
      return (
        <Radio
          name='radio-group'
          key={option.displayName}
          label={option.displayName}
          value={option.value}
          checked={value === option.value}
          onChange={(event) => onChangeHandler(field, (event.target as HTMLInputElement).value)}
        />
      )
    })
  }

  const renderSelect = ({
    field,
    value = '',
    label = '',
    variant = 'outlined',
    options = [],
    onChangeHandler
  }: InputFieldsProps) => {
    return (
      <Select
        label={label}
        variant={variant}
        onChange={(selectedOption: Option) => {
          onChangeHandler(field, selectedOption.value)
        }}
        value={value}
        options={options}
        clearable={true}
        searchable
        menuMaxHeight='200px'
      />
    )
  }

  if (props.type === 'radio') return renderRadioButtons(props)
  if (props.type === 'select') return renderSelect(props)
  return renderTextField(props)
}

export default InputFields
