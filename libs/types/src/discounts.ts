export type DiscretionaryBudget = {
  remainingBudget: number
  programName: string
  programId: string
  programExtId: string
  crop?: string
  allocatedBudget: number
  discountBuckets: DiscountBucket[]
}

export type DiscountBucket = {
  strategy: string
  tactics: string
}
export type DiscretionaryBudgetRequest = {
  salesYear: string
  salesOrgId: string
  brand: string
  accountDealerSAPId: string
  accountGrowerSAPId: string
}

export interface RecommendedRangeRequest {
  userName: string[]
  userId: string[]
  userSapId: string[]
  primaryPayerSapId: string
  treatmentsCorn: string[]
  treatmentsSoy: string[]
  productsCorn: string[]
  productsSoy: string[]
  quantitiesCorn: number[]
  quantitiesSoy: number[]
  retailTotalCorn: number
  retailTotalSoy: number
  brandDiscountsCorn: number
  brandDiscountsSoy: number
  mailingState: string[]
  mailingCounty: string[]
  shippingState: string[]
  shippingCounty: string[]
  legacyId: string[]
}

export interface ProductLevelRange {
  Product: string
  Treatment: string
  Quantity: number
  RecDiscount: string
  RecDiscountPCT: string
}

export interface RecommendedRange {
  cropName: string
  cropLevelRange: string
  productLevelRange: ProductLevelRange[]
}

export type Discounts = Discount[]

export interface Discount {
  remainingBudget?: number
  programName: string
  strategies: Strategy[]
  crop?: string
}

export interface Strategy {
  name: string
  recommendedDiscount?: {
    low: number
    high: number
  }
  displayDiscount: number
  discountValue: number
  discountPercentage: number
  discountUnit: string
  discountDescription?: string
  applyToAll?: boolean
  disableDiscount?: boolean
  strategyId?: string
  programName?: string
  bayerTierId?: string
  isPrepayDiscount?: boolean
  selected?: boolean
  deadline?: string
}
