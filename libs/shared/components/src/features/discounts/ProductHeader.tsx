import styles from './ProductHeader.module.scss'
import { IconButton } from '@element/react-icon-button'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import { getCurrencyFormat } from '@gc/utils'
import { Entry } from '@gc/types'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@gc/hooks'
import { Textfield } from '@element/react-textfield'
import List from '../../ui-common/list/List'
import MediaQuery from 'react-responsive'
import RecommendedRange from './RecommendedRange'
import { useCallback } from 'react'

/* eslint-disable-next-line */
export interface ProductHeaderProps {
  entry: Entry
  unitOfMeasure?: string
  minDiscount?: number
  maxDiscount?: number
  recommendedRange?: string
  isLoading?: boolean
  actionProps?: {
    icon: string
    onClick: (event: React.MouseEvent) => void
  }
  quantity?: string
  updateQuantity?: (event: React.ChangeEvent<HTMLInputElement>) => void
  showRecommendedRange?: boolean
  showDiscountedPrice?: boolean
  showProductQuantity?: boolean
}

export function ProductHeader(props: ProductHeaderProps) {
  const locale = useLocale()
  const { t } = useTranslation()
  const {
    entry,
    actionProps,
    quantity,
    updateQuantity,
    unitOfMeasure,
    recommendedRange,
    showRecommendedRange = true,
    showDiscountedPrice = false,
    showProductQuantity = false
  } = props

  const getProductPrice = useCallback(
    (uom: string | undefined, currencyIso: string, value: number) => {
      return (
        <TypoCaption>
          {getCurrencyFormat(currencyIso, value, locale)}/{uom}
        </TypoCaption>
      )
    },
    [locale]
  )

  const getStyledListItems = (entry: Entry, unitOfMeasure: string | undefined) => {
    const getProductName = (productName: string) => {
      return <TypoSubtitle level={2}>{productName}</TypoSubtitle>
    }

    const items: Array<object> = []

    items.push({
      code: entry.product.name,
      trailingBlockWithAction: actionProps && (
        <IconButton icon={actionProps.icon} onClick={actionProps?.onClick}></IconButton>
      ),
      primaryText: getProductName(entry.product?.name ? entry.product.name : ''),
      secondaryText: entry.totalPricePerUnit && (
        <>
          {}
          {showProductQuantity && (
            <>
              <TypoCaption>{entry?.quantity} units</TypoCaption>
              <br />
            </>
          )}
          {getProductPrice(unitOfMeasure, entry.totalPricePerUnit.currencyIso, entry.totalPricePerUnit.value)}
          <br />
          {showRecommendedRange && (
            <RecommendedRange
              recommendedRange={recommendedRange}
              uom={unitOfMeasure}
              recommendedRangeLabel={t('discounts.recommended_range')}
            />
          )}
        </>
      )
    })
    return items
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {entry && <List className={styles.list} noHover items={getStyledListItems(entry, unitOfMeasure)} divider />}
        {updateQuantity && (
          <MediaQuery maxWidth={1023}>
            <div className={styles['quantity_container']}>
              <Textfield
                variant='outlined'
                dense={true}
                type='number'
                fullWidth
                placeholder={t('common.quantity.label')}
                onChange={updateQuantity}
                value={quantity}
              />
            </div>
          </MediaQuery>
        )}
      </div>
      {showDiscountedPrice && entry?.netPricePerUnit && (
        <div className={styles.discounted_price}>
          <TypoCaption>
            {getCurrencyFormat(entry?.netPricePerUnit.currencyIso, entry?.netPricePerUnit.value, locale)}
          </TypoCaption>
        </div>
      )}
    </div>
  )
}

export default ProductHeader
