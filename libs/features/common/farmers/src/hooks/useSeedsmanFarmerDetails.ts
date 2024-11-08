import { useGetFarmerDetailsByScorQuery } from '../store'
import useFarmerAvailableOffers from './useFarmerAvailableOffers'

export const useSeedsmanFarmerDetails = () => {
  const {
    data: { farmerDetails, licensedGrowerTotals } = { farmerDetails: [], licensedGrowerTotals: undefined },
    isLoading: isFarmerDetailsLoading,
    isFetching: isFarmerDetailsFetching,
    isError: isFarmerDetailsError,
    refetch: refetchMyCropFarmerDetails
  } = useGetFarmerDetailsByScorQuery()
  const {
    data: responseWithOffers,
    isLoading: isAvailableOffersLoading,
    isError: isAvailableOffersError,
    refetch: refetchAvailableOffers
  } = useFarmerAvailableOffers(farmerDetails)

  const refetch = () => {
    refetchMyCropFarmerDetails()
    refetchAvailableOffers()
  }

  return {
    data: { farmerDetails: responseWithOffers, licensedGrowerTotals },
    isLoading: isFarmerDetailsLoading || isAvailableOffersLoading || isFarmerDetailsFetching,
    isError: isFarmerDetailsError || isAvailableOffersError,
    refetch
  }
}

export default useSeedsmanFarmerDetails
