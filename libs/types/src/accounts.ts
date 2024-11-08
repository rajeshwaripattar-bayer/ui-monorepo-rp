export type Account = {
  accountName: string
  irdId: string
  sapAccountId: string
  uId: string
  accountType: string | null
  city: string
  state: string
  zipCode: string
  licenseStatus?: string
  gln?: string
  contactName?: string
  crtva?: string
}
