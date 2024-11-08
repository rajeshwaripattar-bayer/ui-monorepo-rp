export type SelectedAccount = {
  accountName: string
  city: string
  state: string
  entitlements: {
    [key: string]: [string]
  }
  lob: string
  sapAccountId: string
  sourceSystem: string
  uid: string
}
