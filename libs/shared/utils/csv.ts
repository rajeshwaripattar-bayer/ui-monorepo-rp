import _ from 'lodash'
import { IColumn, Datas } from 'react-csv-downloader/dist/esm/lib/csv'
import { FarmerDetails, CropZone, TableColConfig } from '@gc/types'
import { HeaderType } from '../components/src/ui-common/table/Table'
import { utils, writeFile, write } from 'xlsx'

export function getFileNameWithDate(fileName: string) {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0') // January is 01
  const yyyy = today.getFullYear()
  return fileName + yyyy + mm + dd
}

export function getCSVColumns<T>(colData: HeaderType<T>[] | TableColConfig[]) {
  const exportedCols: IColumn[] = []
  colData?.forEach((e) => {
    if (e.excludeFromDownload) return
    if (e.accessor !== undefined && e.header !== undefined) {
      exportedCols.push({
        id: e.accessor.toString(),
        displayName: e.header
      })
    }
  })
  return exportedCols
}

export function formatFarmerDetailsCSVData(farmerDetails: FarmerDetails[]) {
  let clonedFarmerDetails = _.cloneDeep(farmerDetails)
  return clonedFarmerDetails.map((farmerDetail) => {
    // convert if any field value is number to string
    Object.entries(farmerDetail).forEach(([key, value]) => {
      if (typeof value === 'number' && key in farmerDetail) {
        ;(farmerDetail as any)[key] = (value as number).toString()
      }
    })
    // convert cropZones to individual columns
    return farmerDetail.cropZones?.reduce(
      (accum: object, cz: CropZone) => {
        Object.assign(accum, {
          [`${cz.crop}CyZone`]: cz.cyZone,
          [`${cz.crop}CyReassigned`]: cz.cyReassigned ? cz.cyReassigned : '',
          [`${cz.crop}PyZone`]: cz.pyZone,
          [`${cz.crop}PyReassigned`]: cz.pyReassigned ? cz.pyReassigned : ''
        })
        return accum
      },
      {
        ..._.omit(farmerDetail, ['cropZones', 'cyOrder']),
        cyOrder:
          farmerDetail.cyOrder === null || farmerDetail.cyOrder === undefined
            ? farmerDetail.cyOrder
            : farmerDetail.cyOrder.toString()
      }
    )
  }) as Datas
}

export function downloadXlsx(
  columns: { displayName: string; id: string }[],
  data: Record<string, any>[],
  fileName: string
) {
  // Create the header row using displayName
  const headers = columns.map((col) => col.displayName)
  // Convert data to a 2D array using the id from columnDefs
  const dataArray = data.map((row) => columns.map((col) => row[col.id]))
  // Prepend the headers to the data array
  const finalDataArray = [headers, ...dataArray]
  // Create a workbook
  const workbook = utils.book_new()
  // Create a worksheet
  const worksheet = utils.aoa_to_sheet(finalDataArray) // Use aoa_to_sheet for array of arrays
  // Append the worksheet to the workbook
  utils.book_append_sheet(workbook, worksheet, fileName)
  // type to xlsx
  write(workbook, { bookType: 'xlsx', type: 'binary' })
  // Write the workbook to a xlsx file
  writeFile(workbook, `${getFileNameWithDate(fileName)}.xlsx`)
}
