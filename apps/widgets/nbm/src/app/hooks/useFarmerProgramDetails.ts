import {
  useFarmerDetails,
  useGetFvProgramEnrollmentsQuery,
  useGetFvProgramsQuery,
  useGetNbmGrowersQuery
} from '@gc/features-common-farmers'
import { FarmerDetails, FarmerOfferStatus } from '@gc/types'
import { enrollmentStatusMapper, findFvProgramByCompositeKey, findNbmProgramByCompositeKey } from '@gc/utils'
import { skipToken } from '@reduxjs/toolkit/query/react'
import _ from 'lodash'
import { useMemo } from 'react'

type ProgramOfferStatuses = {
  [key: string]: FarmerOfferStatus[]
}

export const useFarmerProgramDetails = () => {
  // Get Farmer Details
  const { data, isLoading, isError, refetch: refetchFarmerDetails } = useFarmerDetails()
  const farmerDetails = useMemo(() => {
    return (data?.farmerDetails ?? []) as FarmerDetails[]
  }, [data?.farmerDetails])

  // Get NBM Growers
  const {
    data: nbmGrowers = [],
    isLoading: isNbmGrowersLoading,
    isError: isNbmGrowersError,
    refetch: refetchNbmGrowers
  } = useGetNbmGrowersQuery(farmerDetails?.length ? { growerUIds: farmerDetails.map((fd) => fd.growerUId) } : skipToken)
  const eligibleNbmGrowers = nbmGrowers.filter((nbmGrower) => nbmGrower.eligiblePrograms?.length)
  const linkedEligibleNbmGrowers = eligibleNbmGrowers.filter((nbmGrower) => !!nbmGrower.fieldViewAccount?.fieldViewId)

  // Get Programs for Linked Farmers with Eligible Programs
  const nbmPrograms = useMemo(() => {
    const programs = linkedEligibleNbmGrowers.flatMap((item) => item.eligiblePrograms)
    const uniquePrograms = _.uniqWith(programs, _.isEqual)
    return uniquePrograms
  }, [linkedEligibleNbmGrowers])

  const {
    data: fvPrograms = [],
    isLoading: isFvProgramsLoading,
    isError: isFvProgramsError,
    refetch: refetchFvPrograms,
    isUninitialized: isUninitializedFvPrograms
  } = useGetFvProgramsQuery(nbmPrograms.length ? { programs: nbmPrograms } : skipToken)

  // Get Program Enrollements
  const {
    data: fvProgramEnrollments = [],
    isError: isFvProgramEnrollmentError,
    isLoading: isFvProgramEnrollmentLoading,
    refetch: refetchFvProgramEnrollements,
    isUninitialized: isUninitializedFvProgramEnrollements
  } = useGetFvProgramEnrollmentsQuery(
    linkedEligibleNbmGrowers.length && fvPrograms.length
      ? {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          fieldViewIds: linkedEligibleNbmGrowers.map((grw) => grw.fieldViewAccount!.fieldViewId),
          fieldViewProgramInstanceIds: fvPrograms.map((fvPrg) => fvPrg.id)
        }
      : skipToken
  )

  // Map Eligible Growers to Offer Status
  const farmerOfferStatuses = useMemo(() => {
    const result: ProgramOfferStatuses = {}
    eligibleNbmGrowers.forEach((nbmGrower) => {
      // Farmer must be working with dealer
      const farmerDtls = farmerDetails.find((fd) => fd.growerUId === nbmGrower.growerUId)
      if (!farmerDtls) return

      nbmGrower.eligiblePrograms.forEach((eligibleProgram) => {
        const programName = _.camelCase(eligibleProgram.name)
        const preferredProgram = findNbmProgramByCompositeKey(eligibleProgram, nbmGrower.preferredPrograms)
        const fvProgram = findFvProgramByCompositeKey(eligibleProgram, fvPrograms)
        const fvEnrollment = fvProgramEnrollments.find(
          (_fvEnrollment) =>
            fvProgram?.id === _fvEnrollment.programInstanceId &&
            _fvEnrollment.fieldViewId === nbmGrower.fieldViewAccount?.fieldViewId &&
            _fvEnrollment.enrollmentStatus
        )

        // Farmer must either have a FV enrollment status OR be preferred
        if (fvEnrollment || preferredProgram) {
          result[programName] ??= []
          result[programName].push({
            name: farmerDtls.farmName || farmerDtls.growerName || '',
            growerUId: farmerDtls.growerUId,
            status: enrollmentStatusMapper[fvEnrollment?.enrollmentStatus ?? 'AVAILABLE'],
            preferred: !!preferredProgram
          })
        }
      })
    })
    return result
  }, [eligibleNbmGrowers, farmerDetails, fvProgramEnrollments, fvPrograms])

  const refetch = () => {
    refetchFarmerDetails()
    refetchNbmGrowers()
    if (!isUninitializedFvPrograms) refetchFvPrograms()
    if (!isUninitializedFvProgramEnrollements) refetchFvProgramEnrollements()
  }

  return {
    data: farmerOfferStatuses,
    isLoading: isLoading || isFvProgramEnrollmentLoading || isNbmGrowersLoading || isFvProgramsLoading,
    isError: isError || isFvProgramEnrollmentError || isNbmGrowersError || isFvProgramsError,
    refetch
  }
}

export default useFarmerProgramDetails
