import styles from './DeliveryDetailsMobile.module.scss'
import { Header } from '../../ui-common/header/Header'
import { TopBar } from '../../ui-common/header/TopBar'
import { Loading } from '../../ui-common/loading/Loading'
import { useTranslation } from 'react-i18next'
import { Icon } from '@element/react-icon'
import { useNavigate, useParams } from 'react-router-dom'
import DeliveryProductListMobile from './DeliveryProductListMobile'
import { AddressInfo, Delivery } from '@gc/types'
import _ from 'lodash'
import { useDeliveriesQueries } from '@gc/redux-store'
import { resolutions } from '@gc/constants'
import { useScreenRes, useLocale } from '@gc/hooks'
import { getDateFromUTC } from '@gc/utils'
import { Card, CardContent, CardTitle, CardBody } from '@element/react-card'
import { TypoSubtitle } from '@element/react-typography'
import { Divider } from '@element/react-divider'
import { Address, AddressCardMobile } from '@gc/components'
import { useEffect, useState } from 'react'

export interface DeliveryDetailsMobileProps {}

export function DeliveryDetailsMobile(props: DeliveryDetailsMobileProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const res = useScreenRes()
  const isMobile = res <= resolutions.M1023
  const { code } = useParams()
  const { useGetDeliveryDetailsQuery } = useDeliveriesQueries()
  const locale = useLocale()
  const isFarmer = true

  const { data: deliveryDetails, isLoading } = useGetDeliveryDetailsQuery({
    deliveryId: code || '',
    isMobile,
    isFarmer
  })
  const [warehouseAddress, setWarehouseAddress] = useState<AddressInfo>()

  const handleClickBack = () => {
    navigate(-1)
  }

  useEffect(() => {
    if (deliveryDetails?.fromWarehouse) {
      const warehouseAddress: AddressInfo = {
        ...(deliveryDetails?.fromWarehouse as AddressInfo),
        addressee: deliveryDetails?.entries[0].warehouse?.name as string
      }
      setWarehouseAddress(warehouseAddress)
    }
  }, [deliveryDetails])

  return (
    <div className={styles.container}>
      <TopBar
        title={t('deliveries.view_delivery.label')}
        leadingBlock={<Icon icon='arrow_back' onClick={handleClickBack} />}
        className={styles.top_bar}
      />
      {isLoading && (
        <div className={styles.loader}>
          <Loading label={t('deliveries.loading_delivery_details_message.label')} />
        </div>
      )}
      {!isLoading && (
        <>
          <div className={styles.header}>
            <Header
              secText1={`${deliveryDetails?.farmer.name}`}
              secText2={`${t('farmers.delivery_date.label')}: ${
                deliveryDetails?.createdOnDateTime
                  ? getDateFromUTC(new Date(deliveryDetails?.createdOnDateTime), locale)
                  : ''
              }`}
              overlineText={deliveryDetails?.statusText}
              title={`${t('deliveries.delivery.label')} ${deliveryDetails?.code}`}
            />
          </div>
          {res <= resolutions.M719 && <Divider />}
          {warehouseAddress && (
            <AddressCardMobile
              title={`${t('common.ship.label')} ${t('common.from.label')}`}
              address={{
                addressInfo: warehouseAddress as AddressInfo,
                typographyType: 'body2'
              }}
            />
          )}
          <DeliveryProductListMobile delivery={deliveryDetails as Delivery} />
        </>
      )}
    </div>
  )
}

export default DeliveryDetailsMobile
