import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query'
import {
  FvFieldEnrollmentSummary,
  NbmGrower,
  FvProgramEnrollment,
  NbmProgram,
  FvProgram,
  FvGrowerAccount
} from '@gc/types'
import { fetchStore } from '@gc/utils'
import { gql } from 'graphql-request'

type FvProgramEnrollmentResponse = {
  id: string
  enrollmentStatus: string
  grower: {
    id: string
  }
  protocol: {
    id: string
    programInstance: {
      name: string
      id: string
    }
  }
}

type FVFieldEnrollmentSummaryResponse = {
  eligibleFieldCount: number
  enrolledFieldCount: number
  programInstance: {
    name: string
    id: string
  }
}

function transformFvProgramEnrollmentResponse(response: FvProgramEnrollmentResponse[]) {
  return response.map((enrollment) => ({
    enrollmentStatus: enrollment.enrollmentStatus,
    fieldViewId: enrollment.grower?.id,
    programInstanceId: enrollment.protocol.programInstance.id
  }))
}

function transformFvFieldEnrollmentSummaryResponse(response: FVFieldEnrollmentSummaryResponse[]) {
  return response.map((enrollment) => ({
    eligibleFieldCount: enrollment.eligibleFieldCount,
    enrolledFieldCount: enrollment.enrolledFieldCount,
    programInstanceId: enrollment.programInstance.id
  }))
}

export function getFvPrograms(builder: EndpointBuilder<BaseQueryFn, string, 'climateApi'>) {
  return builder.query<FvProgram[], { programs: NbmProgram[] }>({
    query: ({ programs }) => {
      const {
        gcPortalConfig: {
          services: { climateApiParams }
        }
      } = fetchStore('domainDef')
      return {
        url: '/v3/graphql',
        query: gql`
          query GetProgramInstances(
            $programInstanceFilter: [ProgramInstanceFilter!]
            $dataLegitimacy: DataLegitimacyQuery
          ) {
            programInstances(programInstanceFilters: $programInstanceFilter, dataLegitimacy: $dataLegitimacy) {
              nodes {
                id
                name
                program {
                  id
                }
                temporalPeriod {
                  ... on ProgramSeason {
                    programYear
                  }
                }
                externalIdentity {
                  id
                }
                configuration {
                  challengerSeedBrands {
                    id
                    name
                  }
                }
              }
            }
          }
        `,
        queryKey: 'programInstances',
        variables: {
          programInstanceFilter: programs.map((program) => ({
            externalId: program.programId,
            programYear: program.year,
            ...(program.brand && { challengerSeedBrandNames: [program.brand] })
          })),
          dataLegitimacy: climateApiParams.dataLegitimacy
        }
      }
    }
  })
}

export function getFvProgramEnrollments(builder: EndpointBuilder<BaseQueryFn, string, 'climateApi'>) {
  return builder.query<FvProgramEnrollment[], { fieldViewProgramInstanceIds: string[]; fieldViewIds: string[] }>({
    query: ({ fieldViewProgramInstanceIds, fieldViewIds }) => {
      const {
        gcPortalConfig: {
          services: { climateApiParams }
        }
      } = fetchStore('domainDef')
      return {
        url: '/v3/graphql',
        query: gql`
          query GetProgramEnrollments(
            $growerIds: [ID!]
            $programInstances: [ProgramInstanceIdFilter!]
            $dataLegitimacy: DataLegitimacyQuery
          ) {
            growerProgramEnrollments(
              dataLegitimacy: $dataLegitimacy
              growerIds: $growerIds
              programInstances: $programInstances
            ) {
              nodes {
                id
                enrollmentStatus
                grower {
                  id
                }
                protocol {
                  id
                  programInstance {
                    name
                    id
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
                hasPreviousPage
                startCursor
              }
            }
          }
        `,
        queryKey: 'growerProgramEnrollments',
        variables: {
          programInstances: fieldViewProgramInstanceIds.map((id) => ({ programInstanceId: id })),
          growerIds: fieldViewIds,
          dataLegitimacy: climateApiParams.dataLegitimacy
        }
      }
    },
    transformResponse: transformFvProgramEnrollmentResponse
  })
}

export function getFvFieldEnrollmentSummary(builder: EndpointBuilder<BaseQueryFn, string, 'climateApi'>) {
  return builder.query<FvFieldEnrollmentSummary[], { fieldViewProgramInstanceIds: string[]; fieldViewId: string }>({
    query: ({ fieldViewProgramInstanceIds, fieldViewId }) => {
      const {
        gcPortalConfig: {
          services: { climateApiParams }
        }
      } = fetchStore('domainDef')
      return {
        url: '/v3/graphql',
        query: gql`
          query fieldEnrollmentSummary(
            $programFilters: [ProgramInstanceIdFilter!]!
            $growerId: ID!
            $dataLegitimacy: DataLegitimacyQuery
          ) {
            fieldEnrollmentSummary(
              growerId: $growerId
              programInstances: $programFilters
              dataLegitimacy: $dataLegitimacy
            ) {
              eligibleFieldCount
              ineligibleFieldCount
              enrolledFieldCount
              programInstance {
                name
                id
              }
            }
          }
        `,
        queryKey: 'fieldEnrollmentSummary',
        variables: {
          programFilters: fieldViewProgramInstanceIds.map((id) => ({ programInstanceId: id })),
          growerId: fieldViewId,
          dataLegitimacy: climateApiParams.dataLegitimacy
        },
        method: 'POST'
      }
    },
    transformResponse: transformFvFieldEnrollmentSummaryResponse
  })
}

export function postFvGrowerNomination(builder: EndpointBuilder<BaseQueryFn, string, 'climateApi'>) {
  return builder.mutation<void, { fieldViewProgramInstanceId: string; fieldViewId: string }>({
    query: ({ fieldViewProgramInstanceId, fieldViewId }) => {
      const {
        gcPortalConfig: {
          services: { climateApiParams }
        }
      } = fetchStore('domainDef')
      return {
        url: '/v3/graphql',
        mutation: gql`
          mutation NominateGrower($input: GrowerProgramNominationInput!) {
            nominateGrower(input: $input) {
              id
              grower {
                id
              }
            }
          }
        `,
        mutationKey: 'nominateGrower',
        variables: {
          input: {
            growerId: fieldViewId,
            programInstanceId: fieldViewProgramInstanceId,
            dataLegitimacy: climateApiParams.dataLegitimacy
          }
        }
      }
    }
  })
}

export function getNbmGrowers(builder: EndpointBuilder<BaseQueryFn, string, 'nbmApi'>) {
  return builder.query<NbmGrower[], { growerUIds: string[] }>({
    query({ growerUIds }) {
      const { brandFamily } = fetchStore('domainDef').gcPortalConfig
      const body = {
        growerUId: growerUIds,
        brand: brandFamily
      }
      return {
        url: '/v1/growers',
        method: 'POST',
        responseHandler: 'content-type',
        body
      }
    }
  })
}

export function linkGrowerFvAccount(builder: EndpointBuilder<BaseQueryFn, string, 'nbmApi'>) {
  return builder.query<
    string,
    { dealerSapId: string; growerIrdId: string; fieldViewId: string; fieldViewEmail: string }
  >({
    query({ dealerSapId, growerIrdId, fieldViewId, fieldViewEmail }) {
      const body = {
        dealerSapId,
        growerIrdId,
        fieldViewId,
        fieldViewEmail
      }
      return {
        url: '/v1/fieldview/accounts/link',
        method: 'POST',
        responseHandler: 'content-type',
        body
      }
    }
  })
}

export function unlinkGrowerFvAccount(builder: EndpointBuilder<BaseQueryFn, string, 'nbmApi'>) {
  return builder.query<string, { dealerSapId: string; growerIrdId: string }>({
    query({ dealerSapId, growerIrdId }) {
      const body = {
        dealerSapId,
        growerIrdId
      }
      return {
        url: '/v1/fieldview/accounts/link',
        method: 'DELETE',
        responseHandler: 'content-type',
        body
      }
    }
  })
}

export function linkedFvAccounts(builder: EndpointBuilder<BaseQueryFn, string, 'nbmApi'>) {
  return builder.query<FvGrowerAccount[], void>({
    query() {
      return {
        url: '/v1/fieldview/accounts/linked',
        responseHandler: 'content-type'
      }
    }
  })
}
