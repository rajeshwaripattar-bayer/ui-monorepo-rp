import { number } from 'prop-types'
import { Product } from './products'

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

export type ShipmentDelivery = {
  agent: Agent
  code: string
  createdOnDateTime: string
  farmer: Farmer
  fromWarehouse?: ShipmentAddress
  lineOfBusiness: string
  plannedShipDate: string
  formattedPlannedShipDate?: string
  salesOrderId: string
  notCancelledEntriesCount?: number
  shipToAddress?: ShipmentAddress
  entries?: ShipmentDeliveryEntry[]
  shipToWarehouse?: ShipmentAddress
  shipmentId?: string
  status: string
  statusText: string
  transferOrderId: string
}

export type ShipmentAddress = {
    country: {
        isocode: string
        name: string
    }
    defaultAddress: boolean
    email?: string
    formattedAddress:string
    id: string
    firstName?: string
    lastName?: string
    line1: string
    line2?: string
    phone?: string
    postalCode: string
    region?:{
        countryIso: string
        isocode: string
        isocodeShort: string
        name: string
    }
    shippingAddress: boolean
    town: string
    visibleInAddressBook: boolean
}

export type Agent = {
    uid: string
    name: string
}

export type ShipmentProduct = {
    available: number,
    code: string,
    name: string
}

export type ShipmentDeliveryEntry = {
    batchName: string
    deliveryItemNumber: string
    product: ShipmentProduct
    quantity: number
    salesOrderEntryNumber: string
    salesUnitOfMeasureCode: string
    seedSize?: string
    storageLocation?: {
        address: WarehouseAddress
        code: string
        locationCode: string
        locationName: string
        plant: string
    }
    transferOrderEntryNumber: string
    warehouse?: ShipmentWareHouse
}
export type WarehouseAddress = {
    city: string
    line1: string
    postalcode: string
    region: string
    streetName: string
    uid: string
}
export type ShipmentWareHouse = {
    address: WarehouseAddress
    code: string
    name: string
    plantCode: string
}

export type ShipmentDeliveries = {
  pagination: Pagination
  delivery: ShipmentDelivery[]
}
