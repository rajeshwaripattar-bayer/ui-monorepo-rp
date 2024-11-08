import React, { useState, useImperativeHandle } from 'react'
import { DataUpdateHandle, refWrapper } from '../RefWrapper'

/* eslint-disable-next-line */
type RowData = object & { rowIndex: number }
export interface DisplayTemplateColumnProps {
  value: string
  tableData: Array<object>
  row: RowData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template?: (value: string, dataRow: any) => React.ReactNode
}

const DisplayTemplateColumn = (props: DisplayTemplateColumnProps, ref: React.ForwardedRef<DataUpdateHandle>) => {
  const { row, template } = props
  const [matchingData, setMatchingData] = useState<RowData>(row)
  useImperativeHandle(ref, () => ({
    updateMatchingData: (updatedRows: RowData[]) => {
      const matching = updatedRows[row.rowIndex]
      if (matching) {
        setMatchingData({ ...matching })
      }
    }
  }))
  return template ? template(props.value, matchingData) : <>NA</>
}

export default refWrapper<DisplayTemplateColumnProps>(DisplayTemplateColumn)
