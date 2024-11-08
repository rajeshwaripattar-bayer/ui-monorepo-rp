import styles from './ReturnsTableExpandedRowTemplate.module.scss'
import { ChannelOrder, ChannelOrderEntry } from '@gc/types'
import { Grid, GridRow, GridCol } from '@element/react-grid'
import { useTranslation } from 'react-i18next'
import { Table, HeaderType } from '../../ui-common/table/Table'
import { MessageWithAction } from '../../ui-common/message-with-action/MessageWithAction'

/* eslint-disable-next-line */
export interface ReturnsTableExpandedRowTemplateProps {
  order: ChannelOrder
}

export function ReturnsTableExpandedRowTemplate(props: ReturnsTableExpandedRowTemplateProps) {
  const { t } = useTranslation()
  const { order } = props
  const headerData: HeaderType<ChannelOrderEntry>[] = [
    {
      header: t('orders.order_id.label'),
      accessor: 'masterOrderNumber',
      disableSortBy: true
    },
    {
      header: t('common.product.label_other'),
      accessor: 'product.name',
      disableSortBy: true
    },
    {
      header: t('common.batch.label'),
      accessor: 'batchNumber',
      disableSortBy: true
    },
    {
      header: t('common.warehouse.label'),
      accessor: 'storageLocation.locationName',
      disableSortBy: true
    },
    {
      header: t('common.quantity.label'),
      accessor: 'quantity',
      align: 'right',
      disableSortBy: true
    },
    {
      header: t('common.uom.label'),
      accessor: 'product.salesUnitOfMeasure',
      disableSortBy: true
    }
  ]
  return (
    <Grid className={styles['expanded_table_row']} fullWidth={true} columnGap='40px'>
      <GridRow>
        <GridCol desktopCol={12}>
          <Table<ChannelOrderEntry>
            data={order.entries ?? []}
            className={styles.returns_expanded_table}
            headers={headerData}
            noContentMessage={
              <MessageWithAction
                messageHeader={t('common.no_results_message_header_label')}
                messageDescription={t('common.no_results_message_description')}
                iconProps={{
                  icon: 'info_outline',
                  variant: 'filled-secondary',
                  className: 'lmnt-theme-secondary-200-bg'
                }}
              />
            }
          />
        </GridCol>
      </GridRow>
    </Grid>
  )
}

export default ReturnsTableExpandedRowTemplate
