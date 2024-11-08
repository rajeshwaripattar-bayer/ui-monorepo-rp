import styles from './QuotesTableExpandedRowTemplate.module.scss'
import { Quote, PriceValueAndCurrency } from '@gc/types'
import { Grid, GridRow, GridCol } from '@element/react-grid'
import { Button } from '@element/react-button'
import { useTranslation } from 'react-i18next'
import { TypoCaption } from '@element/react-typography'
import { getCurrencyFormat } from '@gc/utils'
import { useLocale } from '@gc/hooks'
import List from '../../ui-common/list/List'
/* eslint-disable-next-line */
export interface QuotesTableExpandedRowTemplateProps {
  quote: Quote
  handleViewQuoteDetails: () => void
}

type ListItem = {
  id: number | string
  primaryText: string
  trailingBlock?: React.ReactElement | string
  isBold?: boolean
}

export function QuotesTableExpandedRowTemplate(props: QuotesTableExpandedRowTemplateProps) {
  const { t } = useTranslation()
  const locale = useLocale()
  const { quote } = props

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
    quote.entries
      .filter((e) => !e.rejected)
      ?.forEach((entry, i) =>
        items.push({
          id: i,
          trailingBlock: (
            <>
              <span className={styles.qty_value}>{entry.quantity}</span>
              {entry.displayUom}
            </>
          ),
          primaryText: entry.product.name
        })
      )
    return getStyledItems(items)
  }

  const getPriceSummary = () => {
    const { totalPrice, totalDiscountsPrice, netPrice } = quote
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
        trailingBlock: `-${getDisplayAmount(totalDiscountsPrice)}`
      },
      {
        id: 'netPrice',
        primaryText: t('common.net_price.label'),
        trailingBlock: getDisplayAmount(netPrice),
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
        <GridCol desktopCol={12} horizontalAlign='right'>
          <Button variant='outlined' onClick={props.handleViewQuoteDetails}>
            {t('quotes.view_quote_details.label')}
          </Button>
        </GridCol>
      </GridRow>
    </Grid>
  )
}

export default QuotesTableExpandedRowTemplate
