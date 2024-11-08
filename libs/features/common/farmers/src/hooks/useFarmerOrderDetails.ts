import { usePortalConfig } from '@gc/hooks'
import { useSelectedAccount } from '@gc/hooks'
import { PortalKey } from '@gc/types'

import {
  useGetFarmerOrderDetailsChannelQuery,
  useGetFarmerOrderDetailsNationalQuery,
  useGetFiscalYearQuery,
  useGetLicFarmerSummaryQuery
} from '../store'

export const useFarmerOrderDetails = (props: { dealerSapId: string; growerSapId: string }) => {
  const { portalKey } = usePortalConfig()
  const { lob } = useSelectedAccount()

  let { data: fiscalYear } = useGetFiscalYearQuery()
  fiscalYear = fiscalYear || new Date().getFullYear().toString()

  switch (portalKey) {
    case PortalKey.MyCrop:
      // eslint-disable-next-line react-hooks/rules-of-hooks
      if (lob.toLowerCase() === 'lic') return useGetLicFarmerSummaryQuery({ ...props })

      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useGetFarmerOrderDetailsNationalQuery({ ...props, fiscalYear })
    case PortalKey.SMS:
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useGetFarmerOrderDetailsChannelQuery(props)
    default:
      throw new Error(`The portal parameter portalKey is invalid: ${portalKey}.`)
  }
}

export default useFarmerOrderDetails
