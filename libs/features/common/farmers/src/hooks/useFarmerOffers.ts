import { useSelectedAccount, useUserEntitlements } from '@gc/hooks'
import { FvFieldEnrollmentSummary, FvProgramEnrollment, Offer, Program } from '@gc/types'
import { enrollmentStatusMapper, hasNbmProgramEntitlement, mergePrograms } from '@gc/utils'
import { skipToken } from '@reduxjs/toolkit/query/react'
import _ from 'lodash'

import {
  useGetFvFieldEnrollmentSummaryQuery,
  useGetFvProgramEnrollmentsQuery,
  useGetFvProgramsQuery,
  useGetNbmGrowersQuery
} from '../store'

export type OfferTableRecord = Offer & {
  id: string
  checkEligibility: string
  disableCols: string[]
}

const formatOfferTableRecords = (
  programs: Program[],
  programEnrollments: FvProgramEnrollment[],
  fieldEnrollmentSummaries: FvFieldEnrollmentSummary[],
  disableNominationLink: boolean
): OfferTableRecord[] => {
  return programs.map((program) => {
    const programEnrollment = programEnrollments?.find(
      (programEnrollment) => programEnrollment.programInstanceId === program.fieldViewProgram?.id
    )
    const fieldEnrollmentSummary = fieldEnrollmentSummaries?.find(
      (fieldEnrollment) => fieldEnrollment.programInstanceId === program.fieldViewProgram?.id
    )
    const enrollmentStatus = programEnrollment?.enrollmentStatus
    return {
      // offer data
      ...program,
      offerStatus: enrollmentStatusMapper[enrollmentStatus || 'AVAILABLE'],
      eligibleFields: fieldEnrollmentSummary?.eligibleFieldCount?.toString() ?? '-',
      enrolledFields: fieldEnrollmentSummary?.enrolledFieldCount?.toString() ?? '-',
      // offer table data
      id: `${program.programId}-${program.year}-${program.brand}`,
      checkEligibility: enrollmentStatus ? 'View Fields' : 'Check Fields',
      disableCols: disableNominationLink ? ['checkEligibility'] : []
    }
  })
}

export const useFarmerOffers = (growerUId: string) => {
  const { lob } = useSelectedAccount()
  const userEntitlements = useUserEntitlements()

  const {
    data: nbmGrowers = [],
    isLoading: isNbmGrowersLoading,
    isError: isNbmGrowersError,
    refetch: refetchNbmGrowers
  } = useGetNbmGrowersQuery(growerUId ? { growerUIds: [growerUId] } : skipToken)

  // we will always have max of 1 grower since we queried with 1 ID
  const nbmGrower = nbmGrowers?.[0]
  const fieldViewId = nbmGrower?.fieldViewAccount?.fieldViewId
  const nbmPrograms =
    nbmGrower?.eligiblePrograms.filter((prgm) => {
      return hasNbmProgramEntitlement(userEntitlements, lob, prgm.entitlementName)
    }) ?? []

  const {
    data: fieldViewPrograms = [],
    isLoading: isFieldViewProgramsLoading,
    isError: isFieldViewProgramsError,
    refetch: refetchFieldViewPrograms,
    isUninitialized: isUninitializedFieldViewPrograms
  } = useGetFvProgramsQuery(nbmPrograms.length ? { programs: nbmPrograms } : skipToken)
  const fieldViewProgramInstanceIds = fieldViewPrograms.map((fvPrgm) => fvPrgm.id)

  const {
    data: programEnrollments = [],
    isError: isProgramEnrollmentError,
    isLoading: isProgramEnrollmentLoading,
    refetch: refetchProgramEnrollments,
    isUninitialized: isUninitializedProgramEnrollements
  } = useGetFvProgramEnrollmentsQuery(
    fieldViewId && fieldViewProgramInstanceIds.length
      ? { fieldViewIds: [fieldViewId], fieldViewProgramInstanceIds }
      : skipToken
  )

  const {
    data: fieldEnrollmentSummaries = [],
    isLoading: isfieldEnrollmentSummaryLoading,
    isError: isfieldEnrollmentSummaryError,
    refetch: refetchFieldEnrollmentSummary,
    isUninitialized: isUninitializedFieldEnrollementSummary
  } = useGetFvFieldEnrollmentSummaryQuery(
    fieldViewId && fieldViewProgramInstanceIds.length ? { fieldViewId, fieldViewProgramInstanceIds } : skipToken
  )

  const isCriticalLoading = isNbmGrowersLoading || isFieldViewProgramsLoading || isProgramEnrollmentLoading
  const isCriticalError = isNbmGrowersError || isFieldViewProgramsError || isProgramEnrollmentError

  const isLoading = isCriticalLoading || isfieldEnrollmentSummaryLoading
  const isError = !isLoading && (isCriticalError || isfieldEnrollmentSummaryError)

  const disableNominationLink =
    isCriticalLoading || isCriticalError || !fieldViewId || !fieldViewProgramInstanceIds.length

  const programs = mergePrograms(nbmPrograms, fieldViewPrograms)
  const data = formatOfferTableRecords(programs, programEnrollments, fieldEnrollmentSummaries, disableNominationLink)

  const refetch = () => {
    refetchNbmGrowers()
    if (!isUninitializedFieldViewPrograms) refetchFieldViewPrograms()
    if (!isUninitializedProgramEnrollements) refetchProgramEnrollments()
    if (!isUninitializedFieldEnrollementSummary) refetchFieldEnrollmentSummary()
  }

  return {
    data,
    isLoading,
    isError,
    refetch
  }
}

export default useFarmerOffers
