import styles from './DeliveryTableExpandedRowTemplate.module.scss'
import { AddressInfo, Delivery, DeliveryEntry } from '@gc/types'
import { Grid, GridRow, GridCol } from '@element/react-grid'
import { useTranslation } from 'react-i18next'
import { Table, HeaderType } from '../../ui-common/table/Table'
import _ from 'lodash'
import { TypoCaption } from '@element/react-typography'
import { Address } from '../address/Address'

/* eslint-disable-next-line */
export interface OrdersTableExpandedRowTemplateProps {
  delivery: Delivery
  onClickGoodsIssue: () => void
}

type DeliveryAddress = {
  address: React.ReactElement | string
}

export function OrdersTableExpandedRowTemplate(props: OrdersTableExpandedRowTemplateProps) {
  const { t } = useTranslation()
  const { delivery } = props

  const productsHeaderData: HeaderType<DeliveryEntry>[] = [
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
      header: t('common.quantity.label'),
      accessor: 'quantity',
      disableSortBy: true,
      align: 'right'
    }
  ]

  const addressHeadersData: HeaderType<DeliveryAddress>[] = [
    {
      header: `${t('common.ship.label')} ${t('common.from.label')}`,
      accessor: 'address',
      id: 'address' // It's required for default sorting
    }
  ]
  const entries: DeliveryEntry[] = _.cloneDeep(delivery.entries)

  const totalEntry = {
    product: { name: t('common.total.label') },
    quantity: delivery.entries.reduce((total, entry: DeliveryEntry) => total + entry.quantity, 0)
  } as DeliveryEntry

  entries.push(totalEntry)

  const addressInfo: AddressInfo = {
    ...(delivery?.fromWarehouse as AddressInfo),
    addressee: delivery?.entries[0].warehouse?.name as string
  }

  const address: DeliveryAddress[] = [
    {
      address: delivery?.fromWarehouse ? (
        <Address address={addressInfo} typographyType='caption' className={styles.address} />
      ) : (
        ''
      )
    }
  ]

  return (
    <Grid className={styles['delivery_expanded-table-row']} fullWidth={true} columnGap='40px'>
      <GridRow>
        <GridCol desktopCol={2}>
          <Table<DeliveryAddress>
            data={address}
            className={styles.delivery_address_table}
            headers={addressHeadersData}
          />
        </GridCol>
        <GridCol desktopCol={10} horizontalAlign='right'>
          <Table<DeliveryEntry> data={entries} className={styles.delivery_entry_table} headers={productsHeaderData} />
        </GridCol>
      </GridRow>
    </Grid>
  )
}

export default OrdersTableExpandedRowTemplate
