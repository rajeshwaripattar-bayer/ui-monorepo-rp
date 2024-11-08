export type AddressInfo = {
  addressee: string
  line1: string
  line2?: string
  town: string
  region: region
  postalCode: string
  phone?: string
  country?: country
}

export type region = {
  countryIso: string
  isocode: string
  isocodeShort: string
  name: string
}

export type country = {
  isocode: string
  name: string
}
