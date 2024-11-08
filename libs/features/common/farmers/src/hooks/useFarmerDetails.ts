import { usePortalConfig, useSelectedAccount } from '@gc/hooks'
import { PortalKey } from '@gc/types'

import { useGetFarmersQuery } from '../store/ccApi'
import useLicFarmersList from './useLicFarmersList'
import useMyCropFarmerDetails from './useMyCropFarmerDetails'
import useSeedsmanFarmerDetails from './useSeedsmanFarmerDetails'

export const useFarmerDetails = () => {
  const { portalKey } = usePortalConfig()
  const { sapAccountId, lob } = useSelectedAccount()
  switch (portalKey) {
    case PortalKey.MyCrop:
      // eslint-disable-next-line react-hooks/rules-of-hooks
      if (lob.toLowerCase() === 'lic') return useLicFarmersList()
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useMyCropFarmerDetails()
    case PortalKey.SMS:
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useSeedsmanFarmerDetails()
    case PortalKey.Arrow:
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useGetFarmersQuery({ sapId: sapAccountId })
    default:
      throw new Error(`The portal parameter portalKey is invalid: ${portalKey}.`)
  }
}

export default useFarmerDetails
