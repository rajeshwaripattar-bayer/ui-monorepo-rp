import { Warehouse } from './shared'
import { Product } from './products'
import { AddressInfo } from './addressInfo'

type Pagination = {
  count: number
  page: number
  totalCount: number
  totalPages: number
}

type Farmer = {
  name: string
  uid: string
}
export type Delivery = {
  agentID: string
  code: string
  createdOnDateTime: string
  formattedDeliveryDate: string
  entries: DeliveryEntry[]
  farmerId: string
  farmer: Farmer
  salesOrderId: string
  salesYear: string
  status: string
  statusText: string
  notCancelledEntriesCount?: number
  fromWarehouse: AddressInfo
}

export type DeliveryEntry = {
  deliveryItemNumber: string
  batchName: string
  location: string
  quantity: number
  salesOrderEntryNumber: string
  salesUnitOfMeasureCode: string
  seedSize: string
  warehouse: Warehouse
  product: Product
}

export type Deliveries = {
  pagination: Pagination
  delivery: Delivery[]
}
