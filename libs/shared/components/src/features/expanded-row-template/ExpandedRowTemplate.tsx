import styles from './ExpandedRowTemplate.module.scss'
import { ChannelOrder, PriceValueAndCurrency, ChannelOrderEntry } from '@gc/types'
import { Grid, GridRow, GridCol } from '@element/react-grid'
import { Button, ButtonProps } from '@element/react-button'
import { useTranslation } from 'react-i18next'
import { TypoCaption } from '@element/react-typography'
import { getCurrencyFormat } from '@gc/utils'
import { useLocale } from '@gc/hooks'
import List from '../../ui-common/list/List'

export interface ExpandedRowTemplateProps {
  order: ChannelOrder
  buttonProps?: ButtonProps[]
}

type ListItem = {
  id: number | string
  primaryText: string
  trailingBlock?: React.ReactElement | string
  isBold?: boolean
}

export function ExpandedRowTemplate(props: ExpandedRowTemplateProps) {
  const { t } = useTranslation()
  const locale = useLocale()
  const { order, buttonProps } = props

  const getStyledItems = (items: Array<ListItem>) =>
    items.map(({ id, trailingBlock, primaryText, isBold = false }) => {
      const fontWeight = isBold ? 700 : 400
      return {
        id,
        trailingBlock: <TypoCaption style={{ fontWeight }}>{trailingBlock}</TypoCaption>,
        primaryText: <TypoCaption style={{ fontWeight }}>{primaryText}</TypoCaption>
      }
    })

  const getProductList = () => {
    const items: Array<ListItem> = [
      {
        id: 'product-list-header',
        trailingBlock: (
          <>
            <span className={styles.qty}>{t('common.quantity.label')}</span>
            {t('common.uom.label')}
          </>
        ),
        primaryText: t('common.product.label', { count: 2 }) // Using Pluralization
      }
    ]
    order.entries?.forEach((entry, i) =>
      items.push({
        id: i,
        trailingBlock: (
          <>
            <span className={styles.qty_value}>{entry.quantity}</span>
            {entry.product.salesUnitOfMeasure}
          </>
        ),
        primaryText: entry.product.name
      })
    )
    return getStyledItems(items)
  }

  const getPriceSummary = () => {
    const { totalPrice, totalDiscounts, totalPriceWithTax } = order
    const getDisplayAmount = (valueObj: PriceValueAndCurrency) =>
      getCurrencyFormat(valueObj?.currencyIso, valueObj?.value || 0, locale)
    const items: Array<ListItem> = [
      { id: 'price-summary-header', primaryText: t('common.price_summary.description') },
      {
        id: 'subTotal',
        primaryText: `${t('common.product.label', { count: 2 })}  ${t('common.sub_total.label')}`,
        trailingBlock: getDisplayAmount(totalPrice)
      },
      {
        id: 'discounts',
        primaryText: t('common.discounts.label'),
        trailingBlock: `-${getDisplayAmount(totalDiscounts)}`
      },
      {
        id: 'netPrice',
        primaryText: t('common.net_price.label'),
        trailingBlock: getDisplayAmount(totalPriceWithTax),
        isBold: true
      }
    ]
    return getStyledItems(items)
  }

  return (
    <Grid className={styles['expanded-table-row']} fullWidth={true} columnGap='40px'>
      <GridRow>
        <GridCol desktopCol={8}>
          <List className={styles['list']} divider={true} noHover={true} items={getProductList()} />
        </GridCol>
        <GridCol desktopCol={4}>
          <List className={styles['list']} noHover={true} divider={true} items={getPriceSummary()} />
        </GridCol>
      </GridRow>
      <GridRow>
        {buttonProps && (
          <GridCol desktopCol={12} horizontalAlign='right'>
            <Button {...buttonProps} key='view-details-btn'></Button>
          </GridCol>
        )}
      </GridRow>
    </Grid>
  )
}

export default ExpandedRowTemplate
