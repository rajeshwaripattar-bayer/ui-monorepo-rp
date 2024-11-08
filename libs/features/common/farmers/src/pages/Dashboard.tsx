import { Grid, GridCol, GridRow } from '@element/react-grid'
import { TypoDisplay } from '@element/react-typography'
import { useFarmersModuleConfig, usePortalConfig, useSelectedAccount, useUserEntitlements } from '@gc/hooks'
import { PortalKey, WidgetConfig } from '@gc/types'
import { hasAnyEntitlement } from '@gc/utils'
import React, { Suspense } from 'react'
import { useTranslation } from 'react-i18next'

import { FarmerWidget, LicenseStatusChart } from '../components'
import { useFarmerDetails } from '../hooks'
import { useGetUnitsDetailsQuery } from '../store'
import styles from './Dashboard.module.scss'

const ProgramTrackingWidget = React.lazy(() => import('nbmWidget/ProgramTrackingWidget'))

export const Dashboard = () => {
  const { lob } = useSelectedAccount()
  const userEntitlements = useUserEntitlements()
  const { farmerDashboardConfig = {} } = useFarmersModuleConfig()
  const {
    portalKey,
    nbmWidgetsConfig: { programTracking }
  } = usePortalConfig()
  const { t } = useTranslation()
  const {
    data: { licensedGrowerTotals } = { licensedGrowerTotals: undefined },
    isLoading: isFarmersLoading,
    isError: isFarmersError,
    refetch: refetchFarmerDetails
  } = useFarmerDetails()
  const {
    data: unitDetails,
    isLoading: isUnitsLoading,
    isFetching: isUnitsFetching,
    isError: isUnitsError,
    refetch: refetchUnitsDetails
  } = useGetUnitsDetailsQuery(undefined, { skip: PortalKey.MyCrop === portalKey })
  const domainName = window.location.origin

  const refetchChartData = () => {
    refetchFarmerDetails()
    refetchUnitsDetails()
  }

  const getWidgetDetails = (widget: WidgetConfig) => {
    switch (widget.usage) {
      case 'licenseStatus':
        return {
          title: t('farmers.widgets.FarmerLicenseStatusTitle'),
          loading: isFarmersLoading || isUnitsLoading || isUnitsFetching,
          isError: isFarmersError || isUnitsError,
          WidgetBody: (
            <LicenseStatusChart
              farmersData={licensedGrowerTotals}
              unitsData={unitDetails}
              tabs={widget.tabs}
              isError={isFarmersError || isUnitsError}
              refetch={refetchChartData}
            />
          )
        }
      case 'licenseSearch':
        return {
          title: t('farmers.widgets.farmerLicenseSearchTitle'),
          loading: false,
          isError: false,
          WidgetBody: <div className={styles.licenseSearchImage}></div>
        }
      default:
        return { title: widget?.title || '', loading: false, isError: false, WidgetBody: <div></div> }
    }
  }

  const widgetConfig = farmerDashboardConfig[lob] || []
  const ptWidgetConfig = programTracking[lob] || []

  return (
    <Grid className={styles.dashboardContainer}>
      <GridRow>
        <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
          <TypoDisplay level={3}>FARMERS</TypoDisplay>
        </GridCol>
        {hasAnyEntitlement(userEntitlements, ptWidgetConfig.access) && (
          <GridCol desktopCol={5} tabletCol={8} phoneCol={4}>
            <Suspense fallback='Loading nbm widget...'>
              <ProgramTrackingWidget />
            </Suspense>
          </GridCol>
        )}
        {widgetConfig.map((widget) => {
          const { loading, WidgetBody, title } = getWidgetDetails(widget)

          return (
            <GridCol desktopCol={5} tabletCol={8} phoneCol={4} key={title}>
              <FarmerWidget
                title={title}
                loading={loading}
                actionButtonRedirectLink={`${domainName}/${widget.actionButtonRedirectLink}`}
                actionButtonText={widget.actionButtonText}
                infoText={widget.infoText}
              >
                {WidgetBody}
              </FarmerWidget>
            </GridCol>
          )
        })}
      </GridRow>
    </Grid>
  )
}

export default Dashboard
