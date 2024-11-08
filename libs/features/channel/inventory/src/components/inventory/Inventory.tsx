import styles from './Inventory.module.scss'
import MediaQuery from 'react-responsive'
import { useState } from 'react'
import { getFasteStoreKey } from '@gc/utils'
import { IS_MOBILE, IS_DESKTOP, resolutions } from '@gc/constants'
import { TopBar, Header} from '@gc/components'
import { Tab, TabBar } from '@element/react-tabs'
import lodashMap from 'lodash/map'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useScreenRes } from '@gc/hooks'
import { fasteRoute } from '@gc/utils'
import ShipmentList from '../shipment-list/ShipmentList'
import { useTranslation } from 'react-i18next'

export function Inventory() {
  const { tab } = useParams()
  const tabIndex:number = tab ? Number(tab) : 0
  const [currentTab, setCurrentTab] = useState<number>(tabIndex)
  const inventoryTabs: string[] = ['overview', 'shipments', 'deliveries', 'returns', 'transfers']
  const handleTabActivated = (index: number) => setCurrentTab(index)
  const { t } = useTranslation()
  const res = useScreenRes()
  const isMobile = res <= resolutions.M1023
  useEffect(() => {
    if(!isMobile){
      switch(currentTab){
        case 1: 
          fasteRoute('/inventory/shipments');
          break;
        default:
          break;
      }
    }
  },[currentTab, isMobile])

  useEffect(() => {
    if(isMobile){
      setCurrentTab(tabIndex)
    }
  },[tabIndex, isMobile])

  return (
      <div className={styles['container']}>
          <MediaQuery minWidth={IS_DESKTOP}>
            <div className={styles.header}>
              <Header
                title={t('inventory.inventory.label')}
              />
            </div>
          </MediaQuery>
          <MediaQuery maxWidth={IS_MOBILE}>
            <TopBar title={t('inventory.inventory.label')} />
          </MediaQuery>
          <MediaQuery maxWidth={IS_MOBILE}>
            <TabBar
                className={styles['tabs']}
                clustered={true}
                clusterAlign='start'
                elevated={false}
                variant='surface'
                activeTabIndex={currentTab}
                stacked={false}
                onTabActivated={handleTabActivated}
              >
                {lodashMap(inventoryTabs,(tabName: string) => {
                  return (
                    <Tab key={tabName} clustered={true} indicatorSize='full' indicatorTransition='slide'>
                      {tabName.toUpperCase()}
                    </Tab>
                  )
                })}
              </TabBar>
              <div className={styles['container']}>
                {currentTab === 0 && <div className={styles.container}>Overview...</div>}
                {currentTab === 1 && <div className={styles.container}>
                <ShipmentList
                    tableTitle={t('inventory.shipments.your_shipments.label')}
                    farmerSapId={["0009146406", "0009222320", "0009146406", "0009221009", "0009222320", "0001008596"]}
                    searchTerm=''
                    fasteStoreKey={getFasteStoreKey('inventory', 'shipment')}
          
                  />
                  </div>}
                {currentTab === 2 && <div className={styles.container}>Deliveries...</div>}
                {currentTab === 3 && <div className={styles.container}>Returns...</div>}
                {currentTab === 4 && <div className={styles.container}>Transfers...</div>}
              </div>
            </MediaQuery>
          
      </div>
  )
}

export default Inventory
