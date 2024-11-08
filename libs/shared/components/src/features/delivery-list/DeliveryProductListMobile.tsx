import styles from './DeliveryProductListMobile.module.scss'
import { Card, CardContent, CardTitle, CardBody } from '@element/react-card'
import { List } from '../../ui-common/list/List'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import { useTranslation } from 'react-i18next'
import { Delivery, DeliveryEntry } from '@gc/types'
import { interpunct } from '@gc/constants'

export interface DeliveryProductListMobileProps {
  delivery: Delivery
}

export function DeliveryProductListMobile(props: DeliveryProductListMobileProps) {
  const { t } = useTranslation()

  const getStyledListItems = (entries: Array<DeliveryEntry>) => {
    const items: Array<object> = []
    entries.map((deliveryEntry: DeliveryEntry) =>
      items.push({
        code: deliveryEntry.deliveryItemNumber,
        trailingBlock: (
          <TypoCaption>{`${deliveryEntry.quantity} ${deliveryEntry.salesUnitOfMeasureCode ?? ''}`}</TypoCaption>
        ),
        primaryText: deliveryEntry.product.name,
        secondaryText: (
          <>
            {deliveryEntry.batchName && <TypoCaption data-testid='batchName'>{deliveryEntry.batchName}</TypoCaption>}
            {deliveryEntry.batchName && deliveryEntry.seedSize && interpunct}
            {deliveryEntry.seedSize && <TypoCaption data-testid='seedSize'>{deliveryEntry.seedSize}</TypoCaption>}
          </>
        )
      })
    )
    return items
  }

  return (
    <Card variant='outlined' className={styles.card}>
      <CardContent>
        <CardTitle
          data-testid='title'
          primaryText={<TypoSubtitle level={1}>{`${t('deliveries.products_in_delivery.label')}`}</TypoSubtitle>}
        />
        <CardBody data-testid='orderId' typographyType='overline' className={styles.card_body}>{`${t(
          'orders.order.label'
        )} ${
          props.delivery.salesOrderId.indexOf('-') > 0
            ? props.delivery.salesOrderId.split('-')[1]
            : props.delivery.salesOrderId
        }`}</CardBody>
        <List
          data-testid='productList'
          className={styles.product_list_mobile}
          items={getStyledListItems(props.delivery.entries)}
          noHover={true}
          divider
        />
      </CardContent>
    </Card>
  )
}

export default DeliveryProductListMobile
