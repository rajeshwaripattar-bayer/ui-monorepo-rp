import styles from './ReturnDetailsMobile.module.scss'
import { useState, useEffect, useMemo } from 'react'
import { Header } from '../../ui-common/header/Header'
import { TopBar } from '../../ui-common/header/TopBar'
import { Loading } from '../../ui-common/loading/Loading'
import { useTranslation } from 'react-i18next'
import { Icon } from '@element/react-icon'
import { useNavigate, useParams } from 'react-router-dom'
import ReturnProductListMobile from './ReturnProductListMobile'
import { ReturnedProductsByCrop } from '@gc/components/types'
import { DomainDefGcPortalConfig, OrderEntryCBUS } from '@gc/types'
import _ from 'lodash'

import { useOrdersQueries } from '@gc/redux-store'
import { resolutions } from '@gc/constants'
import { useScreenRes, useLocale, usePortalConfig } from '@gc/hooks'
import { getDateFromUTC } from '@gc/utils'

export interface ReturnDetailsMobileProps {}

export function ReturnDetailsMobile(props: ReturnDetailsMobileProps) {
  const [productsByCrop, setProductsByCrop] = useState<ReturnedProductsByCrop[]>([])
  const { t } = useTranslation()
  const navigate = useNavigate()
  const res = useScreenRes()
  const isMobile = res <= resolutions.M1023
  const { code } = useParams()
  const portalConfig = usePortalConfig()
  const { useGetOrderDetailsQuery } = useOrdersQueries()
  const locale = useLocale()

  const cropList: DomainDefGcPortalConfig['cropList'] = portalConfig?.gcPortalConfig?.cropList
  const cropsNameList = useMemo(() => cropList.map((item) => item.cropName), [cropList])

  const { data: OrderDetails, isLoading } = useGetOrderDetailsQuery({
    orderId: code || '',
    isMobile
  })

  const handleClickBack = () => {
    navigate(-1)
  }
  const removeRejectedItems = (entries: OrderEntryCBUS[]) => {
    return entries?.filter((item: OrderEntryCBUS) => !item.rejected)
  }
  useEffect(() => {
    const entriesByCrop = _.groupBy(removeRejectedItems(OrderDetails?.entries || []), 'cropCode')
    const productsByCrop = _.map(entriesByCrop, (entries, crop) => {
      const products = entries.map((_entry) => {
        const entry = { ..._entry }
        return {
          cropCode: entry.cropCode,
          cropName: entry.cropName || '',
          name: entry.product.name,
          code: entry.product.code,
          quantity: entry.quantity,
          masterOrderNumber: entry.masterOrderNumber,
          warehouseName:
            entry.storageLocation?.locationCode && entry.storageLocation?.locationName
              ? `${entry.storageLocation?.locationCode} - ${entry.storageLocation?.locationName}`
              : '',
          UOM: entry.product.salesUnitOfMeasure || 'SSU'
        }
      })
      return {
        crop: entries[0]?.cropName || '',
        products
      }
    })
    setProductsByCrop(productsByCrop.sort((a, b) => cropsNameList.indexOf(a.crop) - cropsNameList.indexOf(b.crop)))
  }, [OrderDetails?.entries])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <TopBar
          title={t('return.view_return.label')}
          leadingBlock={<Icon icon='arrow_back' onClick={handleClickBack} />}
        />
        {isLoading ? (
          <Loading label={t('returns.loading_returns_message.label')} />
        ) : (
          <>
            <Header
              secText1={`Created ${
                OrderDetails?.created ? getDateFromUTC(new Date(OrderDetails?.created), locale) : ''
              }`}
              overlineText={OrderDetails?.statusText}
              title={`Return ${OrderDetails?.orderNumber}`}
            />
            <ReturnProductListMobile productsByCrop={productsByCrop || []} />
          </>
        )}
      </div>
    </div>
  )
}

export default ReturnDetailsMobile
