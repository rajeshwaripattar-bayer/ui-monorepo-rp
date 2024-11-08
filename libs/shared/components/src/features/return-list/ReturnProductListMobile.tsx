import styles from './ReturnProductListMobile.module.scss'
import { Card, CardContent } from '@element/react-card'
import { ProductListHeader } from '../products/ProductListHeader'
import { List } from '../../ui-common/list/List'
import { TypoCaption } from '@element/react-typography'
import { ReturnedProductsByCrop, ReturnedProducts } from '@gc/components/types'
import { useTranslation } from 'react-i18next'
import cornIcon from '../../../src/icons/icon-corn.svg'
import sorghumIcon from '../../../src/icons/icon-sorghum.svg'
import soyIcon from '../../../src/icons/icon-soybeans.svg'

export interface ReturnProductListMobileProps {
  productsByCrop: ReturnedProductsByCrop[]
}

export function ReturnProductListMobile(props: ReturnProductListMobileProps) {
  const containerClassName = styles.header
  const { t } = useTranslation()

  const getProductHeader = (item: ReturnedProductsByCrop) => {
    return (
      <ProductListHeader
        containerClassName={containerClassName}
        crop={item.crop}
        count={item.products.length}
        icon={<img alt={item.crop} src={getCropIcon(item.crop)} />}
      />
    )
  }

  const getCropIcon = (cropName: string) =>
    ({
      Corn: cornIcon,
      Soybean: soyIcon,
      Sorghum: sorghumIcon
    }[cropName])

  const getStyledListItems = (productList: Array<ReturnedProducts>) => {
    const items: Array<object> = []
    productList.map((product: ReturnedProducts) => {
      items.push({
        code: product.code,
        trailingBlock: <TypoCaption>{`${product.quantity} ${product.UOM}`}</TypoCaption>,
        primaryText: product.name,
        secondaryText: (
          <>
            <TypoCaption>
              {product.masterOrderNumber ? `${t('orders.order_id.label')}: ${product.masterOrderNumber}` : ''} <br />
              {product.warehouseName}
            </TypoCaption>
          </>
        )
      })
    })
    return items
  }

  return (
    <div className={styles.container}>
      {props.productsByCrop.map((item) => {
        return (
          <Card variant='outlined' className={styles['card']}>
            <CardContent>
              {getProductHeader(item)}
              <List
                className={styles['product-list-mobile']}
                listItemClassName={styles['product-list-item']}
                items={getStyledListItems(item.products)}
                noHover={true}
                divider
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default ReturnProductListMobile
