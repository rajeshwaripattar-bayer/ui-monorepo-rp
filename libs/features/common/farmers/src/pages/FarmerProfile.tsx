import { ButtonProps } from '@element/react-button'
import { Icon } from '@element/react-icon'
import { Tab, TabBar } from '@element/react-tabs'
import {
  ActionMenuButton,
  Badge,
  DeliveryList,
  Header,
  OrdersList,
  QuotesList,
  ReturnList,
  SearchBarMobile,
  SubHeader,
  TopBar
} from '@gc/components'
import { IS_MOBILE, resolutions } from '@gc/constants'
import { useAppSessionData, useFarmerActions, useLocale, usePortalConfig, useScreenRes } from '@gc/hooks'
import { Farmer, FarmerActionType, FarmerDetails } from '@gc/types'
import { fasteRoute, fetchStore, getCurrencyFormat, getFasteStoreKey } from '@gc/utils'
import _ from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import MediaQuery from 'react-responsive'
import { useNavigate, useParams } from 'react-router-dom'

import { useFarmerDetails as useGetFarmersQuery } from '../hooks/useFarmerDetails'
import { useAppDispatch, useGetCreditLimitQuery } from '../store'
import styles from './FarmerProfile.module.scss'

export interface FarmerProfileProps {}

export function FarmerProfile() {
  const dispatch = useAppDispatch()
  const portalConfig = usePortalConfig()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const appSessionData = useAppSessionData()
  const res: number = useScreenRes()
  const locale = useLocale()
  const selectedAccount = fetchStore('selectedAccount')
  // const accounts = fetchStore('accounts')

  const { code } = useParams()
  const farmerTabs: string[] = portalConfig?.gcPortalConfig?.farmerTabs
  const actions: FarmerActionType[] = portalConfig?.farmersModule?.farmersProfile?.actions
  const [currentTab, setCurrentTab] = useState<number>(0)

  const { data: { farmerDetails } = { farmerDetails: [] } } = useGetFarmersQuery()
  const farmerInfo = farmerDetails.find((row: Farmer | FarmerDetails) => (row as Farmer).sourceId === code) as Farmer
  const fasteStoreKey = getFasteStoreKey('farmers', 'quotes')
  const [searchTerm, setSearchTerm] = useState(_.get(appSessionData, `${fasteStoreKey}.searchTerm`, '') as string)
  const [openSearch, setOpenSearch] = useState(false)
  const listItemsDesktop = useFarmerActions(actions ?? [])

  const handleQuoteCreate = () => {
    fasteRoute(`/quotes`, { farmer: farmerInfo })
  }

  const {
    data: creditLimit,
    error: creditLimitError,
    isLoading: isCreditLimitLoading
  } = useGetCreditLimitQuery({
    payload: {
      selectedSapId: code || '',
      creditControlNumber: portalConfig.gcPortalConfig.creditControlNumber
    },
    headers: { 'sap-instance': 'pbc-customer-number', 'customer-number': selectedAccount.sapAccountId }
  })

  // const handleClickStatement = () => {
  //   console.log('calling click statement')
  // }
  // const handleClickContactInfo = () => {
  //   console.log('calling click Contact Info')
  // }
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleOpenSearch = () => {
    setOpenSearch(true)
  }

  const handleCloseSearch = () => {
    setSearchTerm('')
    setOpenSearch(false)
  }
  const handleCancelSearch = () => {
    setSearchTerm('')
  }

  const desktopButtonProps: ButtonProps[] = [
    // {
    //   label: 'statement',
    //   onClick: () => handleClickStatement(),
    //   variant: 'outlined'
    // },
    // {
    //   label: 'contact info',
    //   onClick: () => handleClickContactInfo(),
    //   variant: 'outlined'
    // }
  ]

  const handleTabActivated = (index: number) => {
    setCurrentTab(index)
  }

  const getRemainingCreditLimit = () => {
    return creditLimit?.percentage ? creditLimit?.percentage : 0
  }

  return (
    <>
      <div className={styles['desktop_top_bar']}>
        {res <= resolutions.M1023 && (openSearch || searchTerm !== '') ? (
          <SearchBarMobile
            onClick={handleCancelSearch}
            onChange={handleSearch}
            searchTerm={searchTerm}
            actionProps={{ icon: 'close', onClick: handleCloseSearch }}
          />
        ) : (
          <TopBar
            title={t('common.farmer.header.label')}
            leadingBlock={<Icon icon='arrow_back' onClick={() => navigate(-1)} />}
            {...(res <= resolutions.M1023
              ? { trailingBlock: <Icon icon='search' style={{ marginTop: '4px' }} onClick={handleOpenSearch} /> }
              : {})}
          />
        )}
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <Header
            secText1={`${
              farmerInfo?.contracts?.length > 0 && farmerInfo.contracts[0].connectId?.length > 0
                ? `${t('farmers.connect_id.label')}: ${farmerInfo.contracts[0].connectId[0].sourceId} • `
                : ''
            }${farmerInfo?.pricingZones ? farmerInfo.pricingZones[0].pricingZoneDescription : ''}`}
            overlineText={
              farmerInfo?.contracts?.length > 0 && farmerInfo.contracts[0]
                ? `${farmerInfo.contracts[0].contractStatus} • ${farmerInfo.contracts[0].sourceId}`
                : ''
            }
            title={farmerInfo ? farmerInfo.name : ''}
            moreActions={{
              buttonLabel: t('common.create.label'),
              data: farmerInfo,
              listItems: listItemsDesktop,
              leadingIcon: 'add',
              isPrimary: true
            }}
            buttonProps={desktopButtonProps}
          />
          <div className={styles.credit_limit}>
            <SubHeader
              title='Remaining credit limit'
              subtitle={`${getCurrencyFormat('USD', creditLimit?.available || 0, locale)} ${t(
                'common.of.label'
              )}  ${getCurrencyFormat('USD', creditLimit?.creditLimit || 0, locale)}`}
              trailingBlock={
                <Badge themeColor='orange' labelText={`${getRemainingCreditLimit()}% ${t('common.used.label')}`} />
              }
              className={isCreditLimitLoading || !!creditLimitError ? styles.credit_limit_loader : ''}
              loading={isCreditLimitLoading}
              error={!!creditLimitError}
            />
          </div>
        </div>
      </div>
      <div className={styles.tab_container}>
        <MediaQuery maxWidth={IS_MOBILE}>
          <ActionMenuButton
            leadingIcon='add'
            buttonLabel={t('common.actions.label')}
            actionItems={listItemsDesktop}
            data={farmerInfo}
          />
        </MediaQuery>
        <TabBar
          elevated={false}
          variant='surface'
          activeTabIndex={0}
          stacked={false}
          onTabActivated={handleTabActivated}
        >
          {farmerTabs.map((tabName: string) => {
            return (
              <Tab key={tabName} clustered={false} indicatorSize='full' indicatorTransition='slide'>
                {tabName.toUpperCase()}
              </Tab>
            )
          })}
        </TabBar>
      </div>
      {currentTab === 0 && (
        <div className={styles.container}>
          <QuotesList
            tableTitle={`${farmerInfo ? farmerInfo.name : ''} ${t('quotes.label')}`}
            soldToAccounts={[`${code}`]}
            searchTerm={searchTerm}
            fasteStoreKey={getFasteStoreKey('farmers', 'quotes')}
            handleCreateQuote={handleQuoteCreate}
            dispatch={dispatch}
          />
        </div>
      )}
      {currentTab === 1 && (
        <div className={styles.container}>
          <OrdersList
            tableTitle={`${farmerInfo ? farmerInfo.name : ''} ${t('orders.orders.label')}`}
            soldToAccounts={[`${code}`]}
            searchTerm={searchTerm}
            fasteStoreKey={getFasteStoreKey('farmers', 'orders')}
            dispatch={dispatch}
          />
        </div>
      )}
      {currentTab === 2 && (
        <div className={styles.container}>
          <DeliveryList
            tableTitle={`${farmerInfo ? farmerInfo.name : ''} ${t('deliveries.deliveries.label')}`}
            farmerSapId={[`${code}`]}
            searchTerm={searchTerm}
            fasteStoreKey={getFasteStoreKey('farmers', 'deliveries')}
            dispatch={dispatch}
          />
        </div>
      )}
      {currentTab === 3 && (
        <div className={styles.container}>
          <ReturnList
            tableTitle={`${farmerInfo ? farmerInfo.name : ''} ${t('returns.returns.label')}`}
            soldToAccounts={[`${code}`]}
            searchTerm={searchTerm}
            fasteStoreKey={getFasteStoreKey('farmers', 'returns')}
            dispatch={dispatch}
          />
        </div>
      )}
    </>
  )
}

export default FarmerProfile
