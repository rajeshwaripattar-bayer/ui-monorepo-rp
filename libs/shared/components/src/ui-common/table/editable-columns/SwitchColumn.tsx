import { useImperativeHandle, useState } from 'react'
import { Switch, SwitchProps } from '@element/react-switch'
import { DataUpdateHandle, RowData, refWrapper } from '../RefWrapper'

/* eslint-disable-next-line */
export interface SwitchColumnProps extends Omit<SwitchProps, 'disabled' | 'onChange'> {
  checked?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (val: boolean) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  disabled?: boolean | undefined | ((data: any) => boolean)
  row: RowData
}

function SwitchColumn(props: SwitchColumnProps, ref: React.ForwardedRef<DataUpdateHandle>) {
  const { checked, onChange, disabled, row, ...elementSwitchProps } = props
  const [value, setValue] = useState<boolean>(checked || false)
  const [disabledVal, setDisabledVal] = useState(typeof disabled === 'function' ? disabled(row) : disabled)

  useImperativeHandle(ref, () => ({
    updateMatchingData: (updatedRows: RowData[]) => {
      const matching = updatedRows[row.rowIndex]
      if (matching && typeof disabled === 'function') {
        setDisabledVal(disabled(matching))
      }
    }
  }))

  return (
    <Switch
      {...elementSwitchProps}
      disabled={disabledVal}
      checked={value}
      onChange={(newValue: boolean) => {
        setValue(newValue)
        onChange(newValue)
      }}
      data-testid='select-all-switch'
    />
  )
}

export default refWrapper<SwitchColumnProps>(SwitchColumn)
