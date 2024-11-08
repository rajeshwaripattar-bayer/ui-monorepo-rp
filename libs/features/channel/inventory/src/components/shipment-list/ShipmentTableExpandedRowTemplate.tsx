import styles from './ShipmentTableExpandedRowTemplate.module.scss'
import { ShipmentAddress, ShipmentDelivery, ShipmentDeliveryEntry } from '@gc/types'
import { Grid, GridRow, GridCol } from '@element/react-grid'
import { useTranslation } from 'react-i18next'
import { TypoCaption } from '@element/react-typography'
import { Table, HeaderType } from '@gc/components'
import _ from 'lodash'

/* eslint-disable-next-line */
export interface ShipmentTableExpandedRowTemplateProps {
  delivery: ShipmentDelivery
  trackShipment: () => void
}

type Address = {
  address: React.ReactElement | string
}

export function ShipmentTableExpandedRowTemplate(props: ShipmentTableExpandedRowTemplateProps) {
  const { t } = useTranslation()
  const { delivery } = props

  const productsHeaderData: HeaderType<ShipmentDeliveryEntry>[] = [
    {
      header: `${t('deliveries.products_in_delivery.label')}`,
      accessor: 'product.name',
      id: 'product' // It's required for default sorting
    },
    {
      header: t('common.batch.label'),
      accessor: 'batchName',
      disableSortBy: true,
      align: 'left'
    },
    {
      header: t('common.seed_size.label'),
      accessor: 'seedSize',
      disableSortBy: true,
      align: 'left'
    },
    {
      header: t('common.uom.label'),
      accessor: 'salesUnitOfMeasureCode',
      disableSortBy: true,
      align: 'right'
    },
    {
      header: t('common.unit.label_other'),
      accessor: 'quantity',
      disableSortBy: true,
      align: 'right'
    }
  ]

  const fromAddressHeadersData: HeaderType<Address>[] = [
    {
      header: `${t('common.ship.label')} ${t('common.from.label')}`,
      accessor: 'address',
      id: 'address' // It's required for default sorting
    }
  ]
  const toAddressHeadersData: HeaderType<Address>[] = [
    {
      header: `${t('common.ship.label')} ${t('common.to.label')}`,
      accessor: 'address',
      id: 'address' // It's required for default sorting
    }
  ]
  const deliveryEntries: ShipmentDeliveryEntry[] = delivery.entries ? _.cloneDeep(delivery.entries) : []

  const totalEntry = {
    product: { name: t('common.total.label') },
    quantity: delivery.entries?.reduce((total, entry: ShipmentDeliveryEntry) => total + entry.quantity, 0)
  } as ShipmentDeliveryEntry

  deliveryEntries.push(totalEntry)
  const getAddressHeader = (address?:ShipmentAddress) => {
    if(address?.firstName || address?.lastName){
      return `${address.firstName} ${address.lastName}`
    } else {
      return address?.region ? address?.region.name : address?.town
    }
  }

  const fromAddress: Address[] = [
    {
      address: (
        <TypoCaption className={styles.ship_from_content_typography}>
          {getAddressHeader(delivery.fromWarehouse)} <br /> {delivery.fromWarehouse?.formattedAddress} 
        </TypoCaption>
      )
    }
  ]
  const toAddress: Address[] = [
    {
      address: (
        <TypoCaption className={styles.ship_from_content_typography}>
          {getAddressHeader(delivery.shipToAddress)} <br /> {delivery.shipToAddress?.formattedAddress} 
        </TypoCaption>
      )
    }
  ]

  return (
    <Grid className={styles['delivery_expanded-table-row']} fullWidth={true} columnGap='40px'>
      <GridRow>
        <GridCol desktopCol={2}>
          <Grid className={styles.address_list}>
          <GridRow>
            <GridCol desktopCol={12}>
            <Table<Address> data={toAddress} className={styles.delivery_address_table} headers={toAddressHeadersData} />
            </GridCol>

              </GridRow>

              <GridRow>
              <GridCol desktopCol={12}>
            <Table<Address> data={fromAddress} className={styles.delivery_address_table} headers={fromAddressHeadersData} />
              </GridCol>
            </GridRow>
            </Grid> 
        </GridCol>
        <GridCol desktopCol={1}></GridCol>
        <GridCol desktopCol={9} horizontalAlign='right'>
          <Table<ShipmentDeliveryEntry>
            data={deliveryEntries}
            className={styles.delivery_entry_table}
            headers={productsHeaderData}
          />
        </GridCol>
      </GridRow>
    </Grid>
  )

}

export default ShipmentTableExpandedRowTemplate
