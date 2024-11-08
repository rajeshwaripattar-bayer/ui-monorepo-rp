import { Card, CardContent, CardTitle } from '@element/react-card'
import { Icon } from '@element/react-icon'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import { Badge } from '@gc/components'
import { ProductWithPrice, ProductsByCrop } from '@gc/components/types'
import { useLocale } from '@gc/hooks'
import { getCurrencyFormat } from '@gc/utils'
import map from 'lodash/map'
import { Fragment, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import cornIcon from '../../../src/icons/icon-corn.svg'
import sorghumIcon from '../../../src/icons/icon-sorghum.svg'
import soyIcon from '../../../src/icons/icon-soybeans.svg'
import { List } from '../../ui-common/list/List'
import { ProductListFooter } from './ProductListFooter'
import { ProductListHeader } from './ProductListHeader'
import styles from './ProductListMobile.module.scss'
import _ from 'lodash'

export interface ProductListMobileProps {
  titleText: ReactNode
  productsByCrop: ProductsByCrop[]
  currencyIso: string
  handleProductClick?: (product: ProductWithPrice) => void
  inEditMode?: boolean
  editModeProps?: {
    editActions?: ReactNode
    addProductsProps?: {
      onClick: (cropName: string) => void
    }
  }
  quantityAccessor?: string
}

export function ProductListMobile({
  titleText,
  currencyIso,
  inEditMode,
  editModeProps,
  productsByCrop,
  handleProductClick,
  quantityAccessor = 'quantity'
}: Readonly<ProductListMobileProps>) {
  const locale = useLocale()
  const { t } = useTranslation()
  const containerClassName = `lmnt-theme-secondary-50-bg ${styles.header}`

  const handleAddProductsClick = (cropName: string) => {
    editModeProps?.addProductsProps?.onClick(cropName)
  }

  const getProductName = (productName: string) => <TypoSubtitle level={2}>{productName}</TypoSubtitle>

  const getProductPrice = (subTotal: number) => {
    return <TypoCaption>{getCurrencyFormat(currencyIso, subTotal, locale)}</TypoCaption>
  }

  const getProductQty = (qty: number) => {
    return (
      <TypoCaption className={styles['line_height_22']}>
        {qty} {t('common.unit.label', { count: qty })}
      </TypoCaption>
    )
  }

  const getProductDiscount = (productDiscount: Array<object>) => {
    return (
      <TypoCaption themeColor={inEditMode ? 'primary' : undefined} className={styles['line_height_22']}>
        {inEditMode ? <Icon iconSize='xsmall' className={styles['icon-align']} icon='add_circle' /> : ''}
        {productDiscount?.length > 0
          ? ` ${productDiscount.length} ${t('common.discount.label', {
              count: productDiscount.length
            }).toLocaleLowerCase()}`
          : ` ${inEditMode ? t('common.add.label') : '0'}
    ${t('common.discount.label', { count: 2 }).toLocaleLowerCase()}`}
      </TypoCaption>
    )
  }

  const getStyledListItems = (productList: Array<ProductWithPrice>) => {
    return map(productList, (product: ProductWithPrice) => {
      const unconfirmedQuantity =
        product.statusCounts?.find(({ status }) => status === 'common.unconfirmed.label')?.count || 0
      return {
        row: product,
        trailingBlock: getProductPrice(product.subTotal),
        primaryText: getProductName(product.name),
        secondaryText: (
          <>
            {getProductQty(_.get(product, quantityAccessor))}
            <br />
            {getProductDiscount(product.discounts || [])}
          </>
        ),
        overlineText: (product.canOrder === false || unconfirmedQuantity > 0) && (
          <div className={styles['overline-text-wrapper']}>
            {product.canOrder === false && <Badge themeColor='danger' labelText={t('common.on_exclusion.label')} />}
            {unconfirmedQuantity > 0 && (
              <>
                <br />
                <Badge
                  themeColor='orange'
                  labelText={`${unconfirmedQuantity} ${t('common.unit.label_other')} ${t('common.unconfirmed.label')}`}
                />
              </>
            )}
          </div>
        )
      }
    })
  }

  const getCropIcon = (cropName: string) =>
    ({
      Corn: cornIcon,
      Soybean: soyIcon,
      Sorghum: sorghumIcon
    }[cropName])

  const getProductHeader = (item: ProductsByCrop) => {
    return (
      <ProductListHeader
        crop={item.crop}
        averagePrice={item.avgPrice}
        count={item.products.length}
        currencyIso='USD'
        icon={<img alt='' src={getCropIcon(item.crop)} />}
        containerClassName={containerClassName}
        {...(inEditMode && {
          trailingIconButtonProps: {
            icon: 'add_circle',
            variant: 'secondary-on-surface',
            onClick: () => handleAddProductsClick(item.crop)
          }
        })}
      />
    )
  }

  return (
    <div className={styles['container']}>
      <Card variant='outlined' className={styles['card']}>
        <CardContent>
          <CardTitle data-testid='title' className={styles['card-title']} primaryText={titleText} />
          {map(productsByCrop, (item) => {
            return (
              <Fragment key={item.crop}>
                {getProductHeader(item)}
                <List
                  divider
                  className={styles['product-list-mobile']}
                  listItemClassName={styles['product-list-item']}
                  items={getStyledListItems(item.products)}
                  onAction={(_code: string, product: any) => handleProductClick?.(product)}
                />
                <ProductListFooter crop={item.crop} currencyIso={currencyIso} {...item.summary} />
              </Fragment>
            )
          })}
          {editModeProps?.editActions && <div className={styles.edit_actions}>{editModeProps?.editActions}</div>}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProductListMobile
