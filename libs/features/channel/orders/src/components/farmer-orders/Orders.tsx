import styles from './Orders.module.scss'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getFasteStoreKey } from '@gc/utils'
import MediaQuery from 'react-responsive'
import { IS_MOBILE, IS_DESKTOP } from '@gc/constants'
import { Icon } from '@element/react-icon'
import { ActionMenuButton } from '@gc/components'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OrdersList, TopBar, Header, SearchBarMobile } from '@gc/components'
import { Tab, TabBar } from '@element/react-tabs'
import lodashMap from 'lodash/map'
import lodashGet from 'lodash/get'
import { useAppSessionData, usePortalConfig } from '@gc/hooks'
import StockOrderDetails from '../stock-order/StockOrderDetails'

export function Orders() {
  const { t } = useTranslation()
  const portalConfig = usePortalConfig()
  const appSessionData = useAppSessionData()
  const fasteStoreKey = getFasteStoreKey('orders', 'orders')
  const orderTabs: string[] = portalConfig?.gcPortalConfig?.orderTabs
  const [openSearch, setOpenSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState(lodashGet(appSessionData, `${fasteStoreKey}.searchTerm`, '') as string)
  const [currentTab, setCurrentTab] = useState<number>(0)
  //const dispatch = useAppDispatch()

  const handleCreateFarmerOrder = () => {
    console.log('Create Farmer Order was clicked')
  }

  const handleCreateSeedGrowthOrder = () => {
    console.log('Create SeedGrowth Order was clicked')
  }

  const handleOpenSearch = () => setOpenSearch(true)
  const handleTabActivated = (index: number) => setCurrentTab(index)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)
  const handleCancelSearch = () => setSearchTerm('')
  const handleCloseSearch = () => {
    setSearchTerm('')
    setOpenSearch(false)
  }

  return (
    <>
      <div className={styles['container']}>
        <MediaQuery minWidth={IS_DESKTOP}>
          <div className={styles.header}>
            <Header
              title={t('orders.orders.label')}
              buttonProps={[
                {
                  label: t('common.create.label'),
                  onClick: handleCreateFarmerOrder,
                  variant: 'filled',
                  leadingIcon: 'add'
                }
              ]}
            />
          </div>
        </MediaQuery>
        <MediaQuery maxWidth={IS_MOBILE}>
          {openSearch || searchTerm !== '' ? (
            <SearchBarMobile
              onClick={handleCancelSearch}
              onChange={handleSearch}
              searchTerm={searchTerm}
              actionProps={{ icon: 'close', onClick: handleCloseSearch }}
            />
          ) : (
            <TopBar
              title={t('orders.orders.label')}
              trailingBlock={<Icon icon='search' style={{ marginTop: '4px' }} onClick={handleOpenSearch} />}
            />
          )}
          {
            <ActionMenuButton
              leadingIcon='add'
              buttonLabel={t('common.actions.label')}
              actionItems={[
                {
                  value: 'farmerOrder',
                  label: 'Farmer Order', //t('orders.farmer_orders.label'),
                  onClick: handleCreateFarmerOrder
                },
                {
                  value: 'seedGrowthOrder',
                  label: 'SeedGrowth Order', //t('orders.farmer_orders.label'),
                  onClick: handleCreateSeedGrowthOrder
                }
              ]}
              // data={farmerInfo}
            />
          }
        </MediaQuery>
      </div>

      <TabBar
        className={styles['tabs']}
        clustered={true}
        clusterAlign='start'
        elevated={false}
        variant='surface'
        activeTabIndex={0}
        stacked={false}
        onTabActivated={handleTabActivated}
      >
        {lodashMap(orderTabs, (tabName: string) => {
          return (
            <Tab key={tabName} clustered={true} indicatorSize='full' indicatorTransition='slide'>
              {tabName.toUpperCase()}
            </Tab>
          )
        })}
      </TabBar>
      <div className={styles['container']}>
        {currentTab === 0 && (
          <OrdersList
            tableTitle={t('orders.farmer_orders.label')}
            searchTerm={searchTerm}
            fasteStoreKey={fasteStoreKey}
            showFarmerNameColumn
            // dispatch={dispatch}
            handleCreateOrder={handleCreateFarmerOrder}
          />
        )}
        {currentTab === 1 && <StockOrderDetails />}
        {currentTab === 2 && <div className={styles.container}>SeedGrowth...</div>}
      </div>
    </>
  )
}

export default Orders
