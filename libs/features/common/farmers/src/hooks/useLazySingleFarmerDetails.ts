import { useSelectedAccount } from '@gc/hooks'

import { useLazyGetLicSingleFarmerDetailsQuery, useLazyGetSingleFarmerDetailsQuery } from '../store'

export const useLazySingleFarmerDetails = () => {
  const { lob } = useSelectedAccount()

  if (lob.toLowerCase() === 'lic') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLazyGetLicSingleFarmerDetailsQuery()
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLazyGetSingleFarmerDetailsQuery()
  }
}

export default useLazySingleFarmerDetails
