// import styles from './SegmentedButtonColumn.module.scss'
import SegmentButton, { SegmentButtonProps } from '../../segment-button/SegmentButton'
import { DataUpdateHandle, RowData, refWrapper } from '../RefWrapper'
import { useImperativeHandle } from 'react'
/* eslint-disable-next-line */
export interface SegmentedButtonColumnProps extends SegmentButtonProps {
  row: RowData
}

function SegmentedButtonColumn(props: SegmentedButtonColumnProps, ref: React.ForwardedRef<DataUpdateHandle>) {
  const { row, ...segmentButtonProps } = props

  useImperativeHandle(ref, () => ({
    updateMatchingData: (updatedRows: RowData[]) => {
      // const matching = updatedRows[row.rowIndex]
    }
  }))

  return <SegmentButton {...segmentButtonProps} />
}

export default refWrapper<SegmentedButtonColumnProps>(SegmentedButtonColumn)
