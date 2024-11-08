import { graphQLBaseQuery } from '@gc/api/client'
import {
  getFvFieldEnrollmentSummary,
  getFvProgramEnrollments,
  getFvPrograms,
  postFvGrowerNomination
} from '@gc/rtk-queries'
import { createApi } from '@reduxjs/toolkit/query/react'

const acsCommonApi = createApi({
  reducerPath: 'climateApi',
  baseQuery: graphQLBaseQuery({
    baseUrlKey: 'hostname.climateProxy'
  }),
  endpoints: (builder) => ({
    getFvPrograms: getFvPrograms(builder),
    getFvProgramEnrollments: getFvProgramEnrollments(builder),
    getFvFieldEnrollmentSummary: getFvFieldEnrollmentSummary(builder),
    postFvGrowerNomination: postFvGrowerNomination(builder)
  })
})

export const {
  useGetFvProgramsQuery,
  useGetFvProgramEnrollmentsQuery,
  useGetFvFieldEnrollmentSummaryQuery,
  usePostFvGrowerNominationMutation
} = acsCommonApi

export default acsCommonApi
