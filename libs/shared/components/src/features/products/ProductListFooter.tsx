import styles from './ProductListFooter.module.scss'
// import { List } from '../../ui-common/list/List'
import { TypoCaption, TypoBody, TypoSubtitle } from '@element/react-typography'
import { Icon } from '@element/react-icon'
import { getCurrencyFormat, getRoundedValue } from '@gc/utils'
import { List, ListItem } from '@element/react-list'
import { ExpansionPanel, ExpansionIcon, ExpansionTrigger, ExpansionContent } from '@element/react-expansion-panel'
import { useTranslation } from 'react-i18next'
import { useLocale, useScreenRes } from '@gc/hooks'
import { PriceValueAndCurrency, DiscDiscount } from '@gc/types'
import { resolutions, space } from '@gc/constants'
import { useCallback } from 'react'

export interface discounts {
  name: string
  value: number
}

export interface ProductListFooterProps {
  className?: string
  crop: string
  currencyIso: string
  grossPrice: number
  discount: number
  discountPercentage?: number
  discounts: discounts[]
  netPrice?: number
  discretionaryDiscounts: DiscDiscount[]
  totalDiscretionaryDiscount: PriceValueAndCurrency
  grossPriceDiscretionaryDiscount: PriceValueAndCurrency
  netPriceDiscretionaryDiscount: PriceValueAndCurrency
}

export function ProductListFooter(props: ProductListFooterProps) {
  const {
    netPrice,
    crop,
    discretionaryDiscounts,
    totalDiscretionaryDiscount,
    grossPriceDiscretionaryDiscount,
    netPriceDiscretionaryDiscount
  } = props
  const { t } = useTranslation()
  const res = useScreenRes()
  const locale = useLocale()

  const totalDiscountValue = totalDiscretionaryDiscount.value
  let totalDiscountPercentage = 0

  const netTotal = grossPriceDiscretionaryDiscount.value - totalDiscountValue
  totalDiscountPercentage = (totalDiscountValue * 100) / grossPriceDiscretionaryDiscount.value
  const renderText = useCallback(
    (text: string | React.ReactNode, themeColor?: string) => {
      return res > resolutions.M1023 ? (
        <TypoSubtitle level={2} themeColor={themeColor}>
          {text}
        </TypoSubtitle>
      ) : (
        <TypoCaption themeColor={themeColor}>{text}</TypoCaption>
      )
    },
    [res]
  )

  const getStyledExpansionTrigger = (
    <ListItem
      key='discounts-trigger-1'
      noHover
      className={styles['product-footer-list-item']}
      trailingBlock={renderText(
        `-${getCurrencyFormat(totalDiscretionaryDiscount.currencyIso, totalDiscountValue, locale)} (-${getRoundedValue(
          totalDiscountPercentage
        )}%)`
      )}
      secondaryText={renderText(
        <>
          {t('common.discounts.label')}
          <ExpansionIcon
            className={styles['icon-align']}
            expansionId='discount-more'
            lessIcon={<Icon icon='expand_less' />}
            moreIcon={<Icon icon='expand_more' />}
          />
        </>,
        'primary'
      )}
    ></ListItem>
  )

  const getStyledExpansionContent = discretionaryDiscounts.map((item: DiscDiscount, index: number) => {
    return (
      <ListItem
        noHover
        key={`discounts-list-item-${index}`}
        className={styles['product-footer-list-item']}
        primaryText={renderText(
          `${item.programName}${space}-${getCurrencyFormat(
            item.totalDiscount.currencyIso,
            item.totalDiscount.value,
            locale
          )}`
        )}
      ></ListItem>
    )
  })

  const getStyledNetPrice = (
    <ListItem
      noHover
      className={styles['product-footer-list-item']}
      trailingBlock={
        <TypoBody bold level={2}>
          {netPrice ? getCurrencyFormat(netPriceDiscretionaryDiscount.currencyIso, netTotal, locale) : ''}
        </TypoBody>
      }
      primaryText={
        <TypoBody bold level={2}>
          {crop} {t('common.total.label')}
        </TypoBody>
      }
    ></ListItem>
  )

  const getStyledSummaryLabelAndGrossPrice = (
    <>
      <ListItem
        noHover
        className={styles['product-footer-list-item']}
        overlineText={`${props.crop} ${t('common.summary.label')}`}
      ></ListItem>
      <ListItem
        noHover
        className={styles['product-footer-list-item']}
        trailingBlock={renderText(
          getCurrencyFormat(grossPriceDiscretionaryDiscount.currencyIso, grossPriceDiscretionaryDiscount.value, locale)
        )}
        secondaryText={renderText(t('common.price_before_discounts.label'))}
      ></ListItem>
    </>
  )

  return (
    <List className={`${styles.container} ${props.className}`} trailingBlockType='meta'>
      {getStyledSummaryLabelAndGrossPrice}
      {discretionaryDiscounts.length > 0 ? (
        <ExpansionPanel>
          <ExpansionTrigger expansionId='discount-more'>{getStyledExpansionTrigger}</ExpansionTrigger>
          <ExpansionContent
            key='product-list-footer'
            className={styles.discount_list_items}
            expansionId='discount-more'
          >
            {discretionaryDiscounts.length > 0 && getStyledExpansionContent}
          </ExpansionContent>
        </ExpansionPanel>
      ) : (
        <ListItem
          noHover
          className={styles['product-footer-list-item']}
          trailingBlock={renderText(
            `-${getCurrencyFormat(totalDiscretionaryDiscount.currencyIso, totalDiscretionaryDiscount.value, locale)}`
          )}
          secondaryText={renderText(`${t('common.discounts.label')}`)}
        ></ListItem>
      )}
      {getStyledNetPrice}
    </List>
  )
}

export default ProductListFooter
