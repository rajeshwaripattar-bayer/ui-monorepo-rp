import { PriceValueAndCurrency } from './shared'

type Pagination = {
  currentPage: number
  pageSize: number
  sort: string
  totalPages: number
  totalResults: number
}

type User = {
  uid: string
  name: string
}

type Farmer = {
  sapAccountId: string
  name: string
}

type Product = {
  code: string
  name: string
}

export type QuoteEntry = {
  entryNumber: number
  product: Product
  quantity: number
  displayUom?: string
  rejected: boolean
}

export type Quote = {
  code: string
  cartId?: string
  name: string
  status: string
  statusText: string
  creationTime: string
  updatedTime: string
  expirationTime: string
  salesYear: string
  user: User
  farmer: Farmer
  entries: QuoteEntry[]
  orderDiscounts: PriceValueAndCurrency
  totalDiscountsPrice: PriceValueAndCurrency
  totalItems: number
  totalPrice: PriceValueAndCurrency
  netPrice: PriceValueAndCurrency
  nonRejectedLineItemsCount: number
  salesQuoteNumber?: string
  strSQPrintPdfBody?: string
}

export type Quotes = {
  pagination: Pagination
  quotes: Quote[]
}
