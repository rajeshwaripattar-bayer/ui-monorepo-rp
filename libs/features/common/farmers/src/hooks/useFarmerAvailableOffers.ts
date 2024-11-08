import { useSelectedAccount, useUserEntitlements } from '@gc/hooks'
import { FarmerDetails } from '@gc/types'
import { hasNbmProgramEntitlement } from '@gc/utils'
import { skipToken } from '@reduxjs/toolkit/query'
import _ from 'lodash'

import { useGetNbmGrowersQuery } from '../store'

type FarmerDetailsTableRecord = FarmerDetails & {
  offer: string
  preferred: boolean
}

export const useFarmerAvailableOffers = (farmerDetails: FarmerDetails[] = []) => {
  const { lob } = useSelectedAccount()
  const userEntitlements = useUserEntitlements()

  const {
    data: nbmGrowers,
    isError,
    isLoading,
    isFetching,
    refetch
  } = useGetNbmGrowersQuery(
    farmerDetails.length
      ? { growerUIds: farmerDetails.map((el) => el.growerUId) }
      : skipToken
  )

  const farmerDetailsWithOffers = farmerDetails.map((farmerDtls) => {
    const nbmGrower = nbmGrowers?.find((nbmGrower) => nbmGrower.growerUId === farmerDtls.growerUId)
    return {
      ...farmerDtls,
      preferred: !!nbmGrower?.preferredPrograms?.some((prgm) =>
        hasNbmProgramEntitlement(userEntitlements, lob, prgm.entitlementName)
      ),
      offer: `Available (${
        nbmGrower?.eligiblePrograms?.filter((prgm) =>
          hasNbmProgramEntitlement(userEntitlements, lob, prgm.entitlementName)
        )?.length ?? 0
      })`
    }
  }) as FarmerDetailsTableRecord[]

  return {
    data: farmerDetailsWithOffers,
    isLoading: isLoading || isFetching,
    isError,
    refetch
  }
}

export default useFarmerAvailableOffers
