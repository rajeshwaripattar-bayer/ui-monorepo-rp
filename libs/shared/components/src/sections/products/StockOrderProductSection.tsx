import { TypoSubtitle } from '@element/react-typography'
import { StockOrderProductsByCrop } from '@gc/components/types'
import { IS_DESKTOP, IS_MOBILE } from '@gc/constants'
import { usePortalConfig } from '@gc/hooks'
import { DomainDefGcPortalConfig, StockOrderEntry } from '@gc/types'
import { getProductsByCropFromStockOrderEntries } from '@gc/utils'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MediaQuery from 'react-responsive'
import StockOrderProductListDesktop from '../../features/products/StockOrderProductListDesktop'
import StockOrderProductListMobile from '../../features/products/StockOrderProductListMobile'

/* eslint-disable-next-line */
export interface StockOrderProductSectionProps {
  orderStatus: string
  entries: StockOrderEntry[]
  currencyIso?: string
  noMatchingDataContingency?: React.ReactNode
  handleAddProductsClick?: () => void
  handleEdit?: () => void
}

export function StockOrderProductSection({
  orderStatus,
  entries,
  noMatchingDataContingency,
  handleAddProductsClick,
  handleEdit,
  currencyIso = 'USD'
}: Readonly<StockOrderProductSectionProps>) {
  const portalConfig = usePortalConfig()
  const { t } = useTranslation()
  const cropList: DomainDefGcPortalConfig['cropList'] = portalConfig?.gcPortalConfig?.cropList

  const [productsByCrop, setProductsByCrop] = useState<StockOrderProductsByCrop[]>([])

  useEffect(() => {
    if (entries) {
      const _productsByCrop = getProductsByCropFromStockOrderEntries(entries, cropList)
      if (!_.isEqual(productsByCrop, _productsByCrop)) {
        setProductsByCrop(_productsByCrop)
      }
    }
  }, [cropList, entries, productsByCrop])

  return (
    <>
      <MediaQuery maxWidth={IS_MOBILE}>
        <StockOrderProductListMobile
          titleText={
            <TypoSubtitle level={1} bold>
              {t('orders.stock_order.label')}
            </TypoSubtitle>
          }
          currencyIso={currencyIso}
          productListByCrop={productsByCrop}
        />
      </MediaQuery>

      <MediaQuery minWidth={IS_DESKTOP}>
        <StockOrderProductListDesktop
          orderStatus={orderStatus}
          productListByCrop={productsByCrop}
          noMatchingDataContingency={noMatchingDataContingency}
          handleAddProductsClick={handleAddProductsClick}
          handleEdit={handleEdit}
        />
      </MediaQuery>
    </>
  )
}

export default StockOrderProductSection
