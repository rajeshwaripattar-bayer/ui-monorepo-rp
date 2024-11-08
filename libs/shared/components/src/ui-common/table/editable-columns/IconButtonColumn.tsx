import { IconButton, IconButtonProps } from '@element/react-icon-button'
import { Icon, IconProps } from '@element/react-icon'
import { DataUpdateHandle, RowData, refWrapper } from '../RefWrapper'
import { useImperativeHandle, useState } from 'react'

/* eslint-disable-next-line */
export interface IconButtonColumnProps {
  iconProps: IconProps
  iconButtonProps: Omit<IconButtonProps, 'disabled' | 'onClick'> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    disabled?: boolean | undefined | ((data: any) => boolean)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick: () => void
  }
  row: RowData
}

function IconButtonColumn(props: IconButtonColumnProps, ref: React.ForwardedRef<DataUpdateHandle>) {
  const { iconProps, iconButtonProps, row } = props
  const { disabled, onClick, ...restIconButtonProps } = iconButtonProps
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
    <IconButton dense={false} disabled={disabledVal} onClick={onClick} {...restIconButtonProps}>
      <Icon {...iconProps} />
    </IconButton>
  )
}

export default refWrapper<IconButtonColumnProps>(IconButtonColumn)
