export type FvGrowerAccount = {
  federationId: string
  growerIrdId: string
  fieldViewId: string
  fieldViewEmail: string
}

export type FvProgram = {
  id: string
  name: string
  program: {
    id: string
  }
  temporalPeriod: {
    programYear: number
  }
  externalIdentity: {
    id: string
  }
  configuration: {
    challengerSeedBrands: [
      {
        id: string
        name: string
      }
    ]
  }
}

export type FvProgramEnrollment = {
  enrollmentStatus: string
  fieldViewId: string
  programInstanceId: string
}

export type FvFieldEnrollmentSummary = {
  eligibleFieldCount: number
  enrolledFieldCount: number
  programInstanceId: string
}

export type NbmGrower = {
  growerUId: string
  fieldViewAccount: FvGrowerAccount | null
  preferredPrograms: NbmProgram[]
  eligiblePrograms: NbmProgram[]
}

export type NbmProgram = {
  programId: string
  year: number
  brand: string
  name: string
  entitlementName: string
}

export type Program = NbmProgram & {
  fieldViewProgram: FvProgram
}

export type Offer = Program & {
  offerStatus: string
  eligibleFields: string
  enrolledFields: string
}

export type FarmerOfferStatus = {
  name: string
  growerUId: string
  status?: string
  preferred?: boolean
}
