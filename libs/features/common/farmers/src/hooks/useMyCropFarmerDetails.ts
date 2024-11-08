import { skipToken } from '@reduxjs/toolkit/query/react'
import uniq from 'lodash/uniq'

import {
  useGetDealerAccountHierarchyQuery,
  useGetFarmerDetailsByYearQuery,
  useGetFarmerIdsByYearQuery,
  useGetFiscalYearQuery
} from '../store'
import useFarmerAvailableOffers from './useFarmerAvailableOffers'

export const useMyCropFarmerDetails = () => {
  const {
    data: fiscalYear,
    isLoading: isFiscalYearLoading,
    isFetching: isFiscalYearFetching,
    isError: isFiscalYearError,
    refetch: refetchFiscalYear
  } = useGetFiscalYearQuery()
  const {
    data: dealerAccounts,
    isLoading: isDealersLoading,
    isFetching: isDealersFetching,
    isError: isDealersError,
    refetch: refetchDealers
  } = useGetDealerAccountHierarchyQuery()
  const dealerHierarchySapIds: string[] = uniq(dealerAccounts?.map((e) => e.sapAccountId) || [])

  const {
    data: farmerIds,
    isError: isFarmerIdsError,
    isLoading: isFarmerIdsLoading,
    isFetching: isFarmerIdsFetching,
    refetch: refetchFarmerIds
  } = useGetFarmerIdsByYearQuery(dealerAccounts && dealerHierarchySapIds ? { dealerHierarchySapIds } : skipToken)
  const {
    data: { farmerDetails, licensedGrowerTotals } = { farmerDetails: [], licensedGrowerTotals: undefined },
    isLoading: isFarmerDetailsLoading,
    isFetching: isFarmerDetailsFetching,
    isError: isFarmerDetailsError,
    refetch: refetchFarmerDetails
  } = useGetFarmerDetailsByYearQuery(
    fiscalYear && dealerAccounts && farmerIds && dealerHierarchySapIds
      ? { fiscalYear, farmerIds, dealerAccounts, dealerHierarchySapIds }
      : skipToken
  )
  const {
    data: responseWithOffers,
    isLoading: isAvailableOffersLoading,
    isError: isAvailableOffersError,
    refetch: refetchAvailableOffers
  } = useFarmerAvailableOffers(farmerDetails)

  const refetch = () => {
    refetchFiscalYear()
    refetchDealers()
    refetchFarmerIds()
    refetchFarmerDetails()
    refetchAvailableOffers()
  }

  const isFetching = isFiscalYearFetching || isDealersFetching || isFarmerIdsFetching || isFarmerDetailsFetching
  const isLoading =
    isFiscalYearLoading ||
    isDealersLoading ||
    isFarmerIdsLoading ||
    isFarmerDetailsLoading ||
    isAvailableOffersLoading ||
    isFetching
  const isError =
    !isLoading &&
    (isFiscalYearError || isDealersError || isFarmerIdsError || isFarmerDetailsError || isAvailableOffersError)

  return {
    data: { farmerDetails: responseWithOffers, licensedGrowerTotals },
    isLoading,
    isError,
    refetch
  }
}

export default useMyCropFarmerDetails
