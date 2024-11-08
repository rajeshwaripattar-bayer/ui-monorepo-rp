import { Tab, TabBar } from '@element/react-tabs'
import { HeaderType, MessageWithAction, Table } from '@gc/components'
import { FarmerWidget } from '@gc/features-common-farmers'
import { usePortalConfig, useSelectedAccount, useUser } from '@gc/hooks'
import { FarmerOfferStatus } from '@gc/types'
import { getFasteStoreKey, hasAnyEntitlement, sortByColConfig } from '@gc/utils'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useFarmerProgramDetails } from './hooks'

export const ProgramTrackingWidget = () => {
  const [currentTab, setCurrentTab] = useState(1)
  const { data: dashboardData, isLoading, isError, refetch } = useFarmerProgramDetails()
  const {
    nbmWidgetsConfig: { programTracking, farmerProgramsColumns }
  } = usePortalConfig()
  const navigate = useNavigate()
  const { lob, sapAccountId: dealerSapId } = useSelectedAccount()
  const { entitlements } = useUser()
  const { t } = useTranslation()
  const noMessageHeader = t('farmers.dashboard.widgets.programTracking.noMessageHeader')
  const noMessageDescription = t('farmers.dashboard.widgets.programTracking.noMessageDescription')
  const widgetConfig = programTracking[lob]
  const userEntitlements = entitlements[dealerSapId]

  const headers = useMemo(() => {
    return farmerProgramsColumns
      .filter((c) => !c.access || hasAnyEntitlement(userEntitlements, c.access))
      .map((c) => {
        const column = { ...c } as HeaderType<FarmerOfferStatus>
        if (column.displayType === 'link') {
          column.onLinkClick = (offerStatus: FarmerOfferStatus) => {
            navigate('/farmer-info', {
              state: { farmer: offerStatus }
            })
          }
        }
        return column
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerProgramsColumns, userEntitlements])

  const flaggedCols = useMemo(() => headers.some((c) => c.displayType === 'flag'), [headers])

  const handleTabActivated = (index: number) => {
    setCurrentTab(index)
  }

  if (!widgetConfig) {
    return false
  }

  return (
    <FarmerWidget
      title={widgetConfig.title}
      isError={isError}
      noData={false}
      refetch={refetch}
      loading={isLoading}
      actionButtonRedirectLink={widgetConfig.actionButtonRedirectLink}
      actionButtonText={widgetConfig.actionButtonText}
      infoText={widgetConfig.infoText || ''}
      showFlagLabel={flaggedCols}
      noTitleColor={widgetConfig.noTitleColor}
    >
      <>
        <TabBar onTabActivated={handleTabActivated}>
          {widgetConfig.tabs &&
            widgetConfig.tabs.map((tab, tabBarIndex) => {
              const show = hasAnyEntitlement(userEntitlements, tab.access)
              if (show) return <Tab key={tabBarIndex}>{tab.title}</Tab>
              return ''
            })}
        </TabBar>
        {widgetConfig.tabs &&
          widgetConfig.tabs.map((tab, tabIndex) => {
            const show = hasAnyEntitlement(userEntitlements, tab.access)
            if (currentTab === tabIndex && show) {
              const data = sortByColConfig<FarmerOfferStatus>(dashboardData[tab.id], headers)
              return (
                <div style={{ maxHeight: 270 }} key={tabIndex}>
                  <Table
                    key={tabIndex}
                    data={data}
                    headers={headers}
                    noContentMessage={
                      <MessageWithAction
                        messageHeader={noMessageHeader}
                        messageDescription={noMessageDescription}
                        iconProps={{
                          icon: 'chat',
                          variant: 'filled-secondary',
                          className: 'lmnt-theme-secondary-200-bg'
                        }}
                      />
                    }
                    fasteStoreKey={getFasteStoreKey('widgets', 'nbm')}
                  />
                </div>
              )
            }
            return ''
          })}
      </>
    </FarmerWidget>
  )
}

export default ProgramTrackingWidget
