export type BillToParty = {
  isPrimaryBillTo: boolean
  name: string
  paymentTerm: string
  paymentTermDescription: string
  percentage: number
  sapAccountId: string
  city?: string
  state?: string
}

export type PriceValueAndCurrency = {
  currencyIso: string
  currencySymbol: string
  formattedValue: string
  priceType: string
  value: number
}

export type Warehouse = {
  code: string
  name: string
  plantCode?: string
  address?: Address
}

export type PaymentType = {
  code: string
}

export type GrowerInfo = {
  name: string
  uid: string
  sapAccountId: string
}

export type UserNameId = {
  name: string
  uid: string
}

export type Unit = {
  sapAccountId: string
}

type Address = {
  city: string
  line1: string
  postalcode: string
  region: string
  streetName: string
  uid: string
}