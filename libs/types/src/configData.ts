export type StorageLocation = {
  locationCode: string
  locationName: string
  plant: string
}

export type PaymentTerm = {
  code: string
  description: string
  entity: string
  erpSystem: string
  visible: boolean
  displayNotes: string
}

export type Farmer = {
  name: string
  sourceId: string
  partyStatus: string
  relationshipStatus: string
  sapSalesAreas: SapSalesArea[]
  address: Address[]
  cyOrder: boolean
  licenseStatus: string
  pricingZones: PricingZones[]
  contracts: Contracts[]
}

export type SapSalesArea = {
  salesOrg: string
  customerGroup: string
  salesDistrict: string
  salesDistrictDescription: string
  paymentTermsCode: string
  distributionChannel: string
  division: string
  salesOffice: string
  salesGroup: string
}

export type Address = {
  primary: boolean
  cityTown: string
  stateProvinceCode: string
  countryCode: string
  countyDivision: {
    code: string
  }
}

export enum PortalKey {
  MyCrop = 'mycrop',
  SMS = 'seedsmansource',
  Arrow = 'channelarrow'
}

export type PricingZones = {
  cropCode: string
  cropDescription: string
  pricingZoneCode: string
  pricingZoneDescription: string
  subZoneCode: string | null
  subZoneDescription: string | null
  beginDate: Date
  endDate: Date
}

export type Contracts = {
  sourceId: string
  source: string
  contractStatus: string
  connectId: connectId[]
}

export type connectId = {
  source: string
  sourceId: string
}
