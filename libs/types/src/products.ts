export type ProductSearchResponse = {
  breadcrumbs: Breadcrumb[]
  currentQuery: Query
  facets: Facet[]
  freeTextSearch: string
  pagination: Pagination
  products: Product[]
  sorts: Sort[]
}

export type Product = {
  acronymID: string
  available: number
  brandCode: string
  brandName: string
  canOrder?: boolean
  canView?: boolean
  code: string
  crop: string
  description: string
  name: string
  packageDescription: string
  packageSizeCode: string
  packageType: string
  price: Price
  salesUnitOfMeasure: string
  shortPackageType: string
  specialTreatmentCode: string
  specialTreatmentDescription: string
  trait: string
  favorite: boolean
}

export type Price = {
  currencyIso: string
  currencySymbol: string
  value: number
}

type Breadcrumb = {
  facetCode: string
  facetName: string
  facetValueCode: string
  facetValueName: string
  removeQuery: Query
  truncateQuery?: Query
}

type Query = {
  query: { value: string }
  url: string
}

export type Facet = {
  category: boolean
  code: string
  multiSelect: boolean
  name: string
  priority: number
  searchFilter: boolean
  values: {
    count: number
    facetName: string
    facetValue: string
    name: string
    query: Query
    selected: boolean
  }[]
  visible: boolean
}

type Pagination = {
  currentPage: number
  pageSize: number
  sort: string
  totalPages: number
  totalResults: number
}

type Sort = {
  code: string
  name: string
  selected: boolean
}

type EntityProduct = {
  code?: string
}

export type OrderEntry = {
  entityProduct: EntityProduct
  quantity: number
  storageLocationCode: string
}

export type FavoriteProductsResponse = {
  description: string
  entries: Entry[]
  name: string
}

type Entry = {
  addedDate: string
  product: FavoriteProduct
}

export type FavoriteProduct = {
  acronymID: string
  baseUnitofMeasure: string
  brandName: string
  code: string
  name: string
  productTraits: string
  purchasable: boolean
  salesUnitOfMeasure: string
  specialTreatmentCode: string
  specialTreatmentDescription: string
  species: string
  url: string
}
