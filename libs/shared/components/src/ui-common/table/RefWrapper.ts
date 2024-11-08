import { forwardRef, ForwardRefRenderFunction } from 'react'

export type RowData = object & { rowIndex: number }

export type DataUpdateHandle = {
  updateMatchingData: (updatedRows: RowData[]) => void
  updateProps?: (props: unknown | undefined) => void
}

export function refWrapper<T>(element: ForwardRefRenderFunction<DataUpdateHandle, T>) {
  return forwardRef<DataUpdateHandle, T>(element)
}
