import { useFarmersModuleConfig, useSelectedAccount, useUserEntitlements } from '@gc/hooks'
import { CsvDownloadConfig, DomainDefFarmersModuleCols, TableColConfig } from '@gc/types'
import { hasAnyEntitlement } from '@gc/utils'
import { uniqueId } from 'lodash'
import { useMemo } from 'react'

import { useGetFiscalYearQuery } from '../store'

const isTableColConfig = (column: TableColConfig | CsvDownloadConfig): column is TableColConfig => {
  return (column as TableColConfig).header !== undefined
}

const replaceYearTemplate = (str: string | undefined, currentFiscalYear: number) => {
  return str
    ?.replace('{currentYear}', `${currentFiscalYear}`)
    .replace('{priorYear}', `${currentFiscalYear - 1}`)
    .replace('{priorYear-1}', `${currentFiscalYear - 2}`)
}

const configureHeader = (column: TableColConfig | CsvDownloadConfig, currentFiscalYear: number) => {
  if (isTableColConfig(column)) {
    return {
      id: uniqueId(),
      ...column,
      header: replaceYearTemplate(column.header, currentFiscalYear)
    }
  } else {
    return {
      ...column,
      displayName: replaceYearTemplate(column.displayName, currentFiscalYear)
    }
  }
}

export const useColumns = () => {
  const { data: fiscalYear } = useGetFiscalYearQuery()
  const allAppParameters = useFarmersModuleConfig()
  const year = fiscalYear || new Date().getFullYear()
  const { lob } = useSelectedAccount()
  const userEntitlements = useUserEntitlements()

  return useMemo(() => {
    const updatedParams = Object.keys(allAppParameters)
      .filter((key) => key.endsWith('Columns'))
      .reduce((result, key) => {
        return {
          ...result,
          [key]: allAppParameters[key as keyof DomainDefFarmersModuleCols]
            .filter((item: TableColConfig | CsvDownloadConfig) => {
              return !item.access || hasAnyEntitlement(userEntitlements, item.access)
            })
            .map((item: TableColConfig | CsvDownloadConfig) => configureHeader(item, Number(year)))
        }
      }, {}) as DomainDefFarmersModuleCols
    if (lob.toLowerCase() === 'lic') {
      updatedParams.farmerListColumns = updatedParams.farmerLicListColumns
      updatedParams.farmerProductsOrderedColumns = updatedParams.farmerLicProductsOrderedColumns
      updatedParams.farmerCropTotalsColumns = updatedParams.farmerLicCropTotalsColumns
    }
    return updatedParams
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, allAppParameters, userEntitlements, lob])
}

export default useColumns
