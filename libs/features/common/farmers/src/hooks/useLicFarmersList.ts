import { useGetAllLicFarmersQuery } from '../store'
import useFarmerAvailableOffers from './useFarmerAvailableOffers'

export const useLicFarmersList = () => {
  const { data: farmersList, isLoading, isError, refetch: refetchLicFarmers } = useGetAllLicFarmersQuery({})
  const {
    data: responseWithOffers,
    isLoading: isAvailableOffersLoading,
    isError: isAvailableOffersError,
    refetch: refetchAvailableOffers
  } = useFarmerAvailableOffers(farmersList)

  const refetch = () => {
    refetchLicFarmers()
    refetchAvailableOffers()
  }

  return {
    data: { farmerDetails: responseWithOffers, licensedGrowerTotals: undefined },
    isLoading: isLoading || isAvailableOffersLoading,
    isError: isError || isAvailableOffersError,
    refetch
  }
}

export default useLicFarmersList
