export type User = {
  username: string
  userType: string
  addressLine1: string
  addressLine2: string
  brand: string
  city: string
  contactSfdcId: string
  federationId: string
  roleID: string[]
  name: string
  primaryPhone: string
  primaryPhoneType: string
  secondaryPhone: string
  secondaryPhoneType: string
  state: string
  zipCode: string
  testUser: string
  entitlements: {
    [key: string]: [string]
  }
  picture: { type: string }
}
