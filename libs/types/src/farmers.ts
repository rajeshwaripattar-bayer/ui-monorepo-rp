export type FarmerId = {
  dealerSAPId: string
  growerSAPId: string
  sourceSystemName: string
  currentYearOrderFlag: string
}

export type FarmerDetails = {
  farmName: string
  growerName?: string
  firstName?: string
  lastName?: string
  growerSapId: string
  growerIrdId: string
  growerUId: string
  licenseStatus: string
  gln: string
  city: string
  state: string
  zipCode: string
  streetAddress: string
  licensedByAug31: string
  county: string
  phoneNumber: string
  email: string
  cornZone: string
  cropZones: CropZone[]
  crtva?: string
  cyOrder?: boolean
  dealerName?: string
  dealerSapId?: string
}

export type CropZone = {
  crop: string
  cyReassigned: string
  cyZone: string
  pyReassigned: string
  pyZone: string
}

export type LicensedGrowerTotals = {
  licensedPeople: number
  unLicensedPeople: number
  unauthorizedPeople: number
  totalFarmers: string
}

export type LicensedUnitTotals = {
  licensedUnit: number
  unLicensedUnit: number
  unauthorizedUnit: number
  totalUnits: string
}

export type StatusIndicator = {
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
}

export type creditLimit = {
  percentage: number
  used: number
  available: number
  creditLimit: number
}
