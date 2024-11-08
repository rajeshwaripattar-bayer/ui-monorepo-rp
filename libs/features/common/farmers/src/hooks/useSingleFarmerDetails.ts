import { usePortalConfig, useSelectedAccount } from '@gc/hooks'
import { PortalKey } from '@gc/types'
import { skipToken } from '@reduxjs/toolkit/query/react'

import { useGetLicSingleFarmerDetailsQuery, useGetSingleFarmerDetailsQuery } from '../store'

export const useSingleFarmerDetails = (props: { growerSapId: string; growerIrdId: string }) => {
  const { portalKey } = usePortalConfig()
  const { lob, sapAccountId: dealerSapId } = useSelectedAccount()
  const showCropZoneTable = portalKey === PortalKey.MyCrop
  if (lob.toLowerCase() === 'lic') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useGetLicSingleFarmerDetailsQuery(
      showCropZoneTable && props.growerIrdId
        ? {
            growerIrdId: props.growerIrdId,
            growerSapId: dealerSapId
          }
        : skipToken
    )
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useGetSingleFarmerDetailsQuery(
    showCropZoneTable && (props.growerIrdId || props.growerSapId)
      ? {
          growerIrdId: props.growerIrdId,
          growerSapId: props.growerSapId
        }
      : skipToken
  )
}

export default useSingleFarmerDetails
