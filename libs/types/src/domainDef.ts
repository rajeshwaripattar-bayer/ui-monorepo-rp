import { ReactNode } from 'react'
import { FvGrowerAccount } from './programs'

export type CsvDownloadConfig = {
  displayName?: string
  id: string
  access: string[]
}

export type DomainDef = {
  gcPortalConfig: DomainDefGcPortalConfig
  farmersModule: DomainDefFarmersModule
  nbmWidgetsConfig: DomainDefNbmWidgetsConfig
  quotesModule: DomainDefQuotesModule
  portalKey: string
}

export type DomainDefGcPortalConfig = {
  brandFamily: string
  quotesPageSize: number
  productsPageSize: number
  uiCommon: {
    badgeThemeColor: ColorConfig[]
  }
  crops: string[]
  cropList: { cropCode: string; cropName: string }[]
  expirationDateOptions: ExpirationDateOption[]
  paymentTermsConfig: PaymentTermConfig[]
  orderConfig: OrderConfig
  farmerTabs: string[]
  orderTabs: string[]
  discounts: discounts
  seedYear: string
  salesYear: string[]
  creditControlNumber: string
}

export type FarmerActionType = 'quote' | 'order' | 'delivery' | 'return'
export type FarmersProfileConfig = {
  actions: FarmerActionType[]
}

export type QuoteActionType = 'edit' | 'duplicate' | 'convertToOrder' | 'shareWithFarmer' | 'print' | 'delete'
export type DomainDefQuotesModule = {
  quoteActions: QuoteActionType[]
}

export type DomainDefFarmersModuleCols = {
  farmerListColumns: TableColConfig[]
  farmerLicListColumns: TableColConfig[]
  farmerDownloadReportColumns: CsvDownloadConfig[]
  farmerListNBMColumns: TableColConfig[]
  farmerCropTotalsColumns: TableColConfig[]
  farmerLicCropTotalsColumns: TableColConfig[]
  farmerProductsOrderedColumns: TableColConfig[]
  farmerLicProductsOrderedColumns: TableColConfig[]
  zoneDetailsColumns: TableColConfig[]
}

export type DomainDefFarmersModule = DomainDefFarmersModuleCols & {
  farmerOffersColumns: TableColConfig[]
  farmerDetailFields: LabelValueConfig[]
  licenseFormConfig: FormConfig[]
  licenseFarmersTableColumns: TableColConfig[]
  farmersProfile: FarmersProfileConfig
  myView: {
    [key: string]: { lobDisplayName: string; logo: string; backgroundImage: string }
  }
  aemPathMapper: {
    [key: string]: string
  }
  nbmProgramUrls: {
    [key: string]: string
  }
  farmerDashboardConfig: {
    [key: string]: [WidgetConfig]
  }
}

export type DomainDefNbmWidgetsConfig = {
  programTracking: {
    [key: string]: NbmProgramTrackinWidgetConfig
  }
  farmerProgramsColumns: [ProgramTrackingColConfig]
}

export type NbmProgramTrackinWidgetConfig = {
  title: string
  actionButtonRedirectLink: string
  actionButtonText?: string
  infoText?: string
  noTitleColor?: boolean
  access: string[]
  tabs?: {
    title: string
    id: string
    access: string[]
  }[]
}
export type WidgetConfig = {
  title: string
  usage: string
  actionButtonRedirectLink: string
  actionButtonText?: string
  infoText?: string
  tabs?: {
    title: string
    colors: string[]
    usage: string
  }[]
}

export type discounts = {
  nonDiscretionaryDiscount: nonDiscretionaryDiscount
}

export type nonDiscretionaryDiscount = {
  defaultPrepay: string
}

export type ColorConfig = {
  color: string
  text: string[]
}

export type ExpirationDateOption = {
  code: string
  description: string
  timePeriod: string
  duration: number
  expirationDate: Date
}

export type PaymentTermConfig = {
  paymentTerm: string
  paymentTermDescription: string
  paymentDueMonth: string
  paymentDueDate: string
  paymentTermProgramNotes: string
}

export type OrderConfig = {
  division: string
  salesOrg: string
  distributionChannel: string
  documentType: string
  salesOffice: string
  salesYear: string
  salesOrgId: string
}

export type TableColConfig = {
  accessor: string | ((a: unknown) => ReactNode)
  header: string
  excludeFromDownload?: boolean
  id?: string
  defaultSort?: string
  defaultSortOrder?: number
  displayType?: string
  displayConfig: object
  sortable?: boolean
  searchable?: boolean
  filterable?: string[]
  actions?: string[]
  access?: string[]
}

export type ProgramTrackingColConfig = {
  accessor: string | ((a: unknown) => ReactNode)
  header: string
  displayType?: string
  access?: string[]
}

export type LabelValueConfig = {
  displayName: string
  displayValue: string
}

export type FormConfig = {
  id: string
  type: string
  group: string
  label?: string
  value?: string
  disabled?: boolean
  validationRule?: string
  validationMessage?: string
  checkValidation?: boolean
  options?: [{ value: string; text?: string; displayName?: string }]
}

export type SortByData = {
  id: string
  desc: boolean
  order: number
}

export type AppSessionData = {
  [fasteStoreKey: string]: {
    searchTerm?: string
    GrowerFieldViewDetails?: FvGrowerAccount
    filters?: {
      [category: string]: string[]
    }[]
    sortBy?: SortByData[]
  }
}
