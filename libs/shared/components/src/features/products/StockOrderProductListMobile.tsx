import { Card, CardContent } from '@element/react-card'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import { List, SegmentButton } from '@gc/components'
import { StockOrderProduct, StockOrderProductsByCrop } from '@gc/components/types'
import { getProductName } from '@gc/utils'
import { map } from 'lodash'
import { Fragment, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProductListHeader from './ProductListHeader'
import styles from './StockOrderProductListMobile.module.scss'

const containerClassName = `lmnt-theme-secondary-50-bg ${styles.header}`


export interface StockOrderProductListMobileProps {
  currencyIso: string
  titleText: React.ReactNode
  productListByCrop: StockOrderProductsByCrop[]
  handleProductClick?: (stockOrder: StockOrderProductsByCrop) => void
}

export function StockOrderProductListMobile({
  productListByCrop,
  handleProductClick,
  currencyIso = 'USD'
}: Readonly<StockOrderProductListMobileProps>) {
  const { t } = useTranslation()
  const [confirmedValue, setConfirmedValue] = useState('unconfirmed')
  const isConfirmed = useMemo(() => confirmedValue === 'confirmed', [confirmedValue])

  const confirmedSegmentData = useMemo(
    () => [
      { name: t('common.unconfirmed.label'), value: 'unconfirmed' },
      { name: t('common.confirmed.label'), value: 'confirmed' }
    ],
    [t]
  )

  const getProductHeader = (item: StockOrderProductsByCrop) => {
    return (
      <ProductListHeader
        crop={item.crop}
        currencyIso={currencyIso}
        count={item.products.length}
        containerClassName={containerClassName}
      />
    )
  }

  const getProductQty = (qty = 0, confirmedQty = 0, unconfirmedQty = 0) => {
    // TODO: what should we do for these colors? Better way to handle this? theme??
    const confirmedColor = isConfirmed && unconfirmedQty === 0 ? '#01830C' : '#9E6400'
    const confirmedQuantity = isConfirmed ? confirmedQty : unconfirmedQty
    const confirmedLabel = isConfirmed ? t('common.conf.label') : t('common.unconf.label')

    return (
      <>
        <TypoCaption className={styles.line_height_22}>
          {qty} ({t('common.ssu.label', { count: qty })})
        </TypoCaption>
        &nbsp; • &nbsp;
        <TypoCaption style={{ color: confirmedColor }}>{`${confirmedQuantity} ${confirmedLabel}`}</TypoCaption>
      </>
    )
  }

  const getStyledListItems = (stockOrderproductList: Array<StockOrderProduct>) => {
    return map(stockOrderproductList, (stockOrderProduct: StockOrderProduct) => {
      const quantity = stockOrderProduct.quantity
      const confirmedQuantity = stockOrderProduct.confirmedQuantity
      const unconfirmedQuantity = stockOrderProduct.unconfirmedQuantity

      return {
        row: stockOrderProduct,
        primaryText: getProductName(stockOrderProduct.name),
        secondaryText: (
          <>
            <TypoSubtitle level={2}>{stockOrderProduct.warehouse.text}</TypoSubtitle>
            <br />
            {getProductQty(quantity, confirmedQuantity, unconfirmedQuantity)}
          </>
        )
      }
    })
  }

  const cardItems = useMemo(() => {
    return map(productListByCrop, (item) => {
      return (
        <Fragment key={item.crop}>
          {getProductHeader(item)}

          <List
            divider
            className={styles['stock-order-list-mobile']}
            listItemClassName={styles['stock-order-list-item']}
            items={getStyledListItems(item.products)}
            onAction={(_code: string, product: any) => handleProductClick?.(product)}
          />
        </Fragment>
      )
    })
  }, [productListByCrop, isConfirmed])

  return (
    <div className={styles.container}>
      <Card variant='outlined' className={styles.card}>
        <CardContent>
          <div className={styles['card-header']}>
            <SegmentButton
              data={confirmedSegmentData}
              selectedValue={confirmedValue}
              buttonProps={{ buttonSize: 'xsmall', className: styles['segment-button'] }}
              onClick={(selectedValue: string) => setConfirmedValue(selectedValue)}
            />
          </div>

          {cardItems}
        </CardContent>
      </Card>
    </div>
  )
}

export default StockOrderProductListMobile
