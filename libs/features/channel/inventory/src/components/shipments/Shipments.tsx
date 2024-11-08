import styles from './Shipments.module.scss'
import MediaQuery from 'react-responsive'
import { IS_DESKTOP, resolutions } from '@gc/constants'
import { Header } from '@gc/components'
import ShipmentList from '../shipment-list/ShipmentList'
import { getFasteStoreKey } from '@gc/utils'
import { useAppDispatch } from '../../store'
import { useScreenRes } from '@gc/hooks'
import { fasteRoute } from '@gc/utils'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function Shipments() {
  const res = useScreenRes()
  const isMobile = res <= resolutions.M1023
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  useEffect(() => {
    if(isMobile){
      fasteRoute('/inventory/1')
    }
  },[isMobile])
  return (
  
    <div className={styles['container']}>
    <MediaQuery minWidth={IS_DESKTOP}>
        <div className={styles.header}>
          <Header
            title={t('inventory.shipments.your_shipments.label')}
          />
        </div>
      </MediaQuery>
      <MediaQuery minWidth={IS_DESKTOP}>
        <ShipmentList
            tableTitle={t('inventory.shipments.your_shipments.label')}
            farmerSapId={["0009146406", "0009222320", "0009146406", "0009221009", "0009222320", "0001008596"]}
            searchTerm=''
            fasteStoreKey={getFasteStoreKey('inventory', 'shipment')}
  
          />
      </MediaQuery>
  </div>
  )
}

export default Shipments
