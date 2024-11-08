import { Grid, GridCol, GridRow } from '@element/react-grid'
import { TypoDisplay } from '@element/react-typography'
import { HeaderType, Loading, MessageWithAction, Table } from '@gc/components'
import { useFarmersModuleConfig, usePortalConfig, useSelectedAccount, useUserEntitlements } from '@gc/hooks'
import { Account, CropZone, FarmerDetails, FarmerOfferStatus, OrderDetails, PortalKey } from '@gc/types'
import { checkFarmerDetails, fromUId, getAccountName, hasNbmEntitlement } from '@gc/utils'
import { isEmpty, mapKeys, omitBy } from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { BackButton, FarmerDetails as FarmerDetailsDisplay, FieldViewLinkButton, NominationModal } from '../components'
import {
  OfferTableRecord,
  useColumns,
  useCropTotals,
  useFarmerOffers,
  useFarmerOrderDetails,
  useLazySingleFarmerDetails,
  useProductsOrdered,
  useSingleFarmerDetails
} from '../hooks'
import styles from './FarmerInfo.module.scss'

type Farmer = FarmerDetails | Account | FarmerOfferStatus

type MsgKeys = {
  errorMsgHeader: string
  errorMsg: string
  noDataMsgHeader: string
  noDataMsg: string
  loadingMsg: string
}

const MSG_KEYS = {
  farmerPrograms: {
    errorMsgHeader: 'farmer.offers_api_error_header_msg',
    errorMsg: 'farmer.offers_api_error_description_msg',
    noDataMsgHeader: 'farmer.offers_no_data_header_msg',
    noDataMsg: 'farmer.offers_no_data_description_msg',
    loadingMsg: 'farmers.tables.farmerOffers.tableLoading'
  },
  cropTotal: {
    errorMsgHeader: 'farmer.cropTotal_api_error_header_msg',
    errorMsg: 'farmer.cropTotal_api_error_description_msg',
    noDataMsgHeader: 'farmer.cropTotal_no_data_header_msg',
    noDataMsg: 'farmer.cropTotal_no_data_description_msg',
    loadingMsg: 'farmers.tables.cropTotals.tableLoading'
  },
  productsOrdered: {
    errorMsgHeader: 'farmer.productsOrdered_api_error_header_msg',
    errorMsg: 'farmer.productsOrdered_api_error_description_msg',
    noDataMsgHeader: 'farmer.productsOrdered_no_data_header_msg',
    noDataMsg: 'farmer.productsOrdered_no_data_description_msg',
    loadingMsg: 'farmers.tables.productsOrdered.tableLoading'
  },
  zoneHistory: {
    errorMsgHeader: 'farmer.zoneHistory_api_error_header_msg',
    errorMsg: 'farmer.zoneHistory_api_error_description_msg',
    noDataMsgHeader: 'farmer.zoneHistory_no_data_header_msg',
    noDataMsg: 'farmer.zoneHistory_no_data_description_msg',
    loadingMsg: 'farmers.tables.zoneTable.tableLoading'
  }
} as { [key: string]: MsgKeys }

const isAccount = (farmer: Farmer): farmer is Account => {
  return (farmer as Account).accountName !== undefined
}

const isFarmerOfferStatus = (farmer: Farmer): farmer is FarmerOfferStatus => {
  return (farmer as FarmerOfferStatus).name !== undefined
}

const previousPageStateTransformer = (farmer: Farmer) => {
  if (!farmer) return {} as FarmerDetails

  let propsToRename: Record<string, string> = {}
  if (isAccount(farmer)) {
    propsToRename = {
      accountName: 'farmName',
      irdId: 'growerIrdId',
      sapAccountId: 'growerSapId',
      uId: 'growerUId'
    }
  } else if (isFarmerOfferStatus(farmer)) {
    propsToRename = {
      name: 'farmName'
    }
  } // else is already FarmerDetails

  // clone, rename props, and cast type
  const farmerDetails = (isEmpty(propsToRename)
    ? farmer
    : mapKeys(farmer, (value, key) => {
        return propsToRename[key] ?? key
      })) as unknown as FarmerDetails

  const { irdId, sapId } = fromUId(farmerDetails.growerUId)
  farmerDetails.growerIrdId ??= irdId
  farmerDetails.growerSapId ??= sapId

  const [firstName, ...lastName] = getAccountName(farmerDetails)?.split(' ') ?? ['', '']
  farmerDetails.firstName ??= firstName
  farmerDetails.lastName ??= lastName?.join(' ')

  return farmerDetails
}

export const FarmerInfo = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { portalKey } = usePortalConfig()
  const { farmerDetailFields, farmerOffersColumns } = useFarmersModuleConfig()
  const [openNominationModal, setOpenNominationModal] = useState(false)
  const [farmerDetails, setFarmerDetails] = useState<FarmerDetails>(() =>
    previousPageStateTransformer(location.state?.farmer)
  )
  const [selectedOffer, setSelectedOffer] = useState<OfferTableRecord>()
  const { farmerCropTotalsColumns, farmerProductsOrderedColumns, zoneDetailsColumns } = useColumns()
  const { sapAccountId, lob } = useSelectedAccount()
  const userEntitlements = useUserEntitlements()
  const isNbmEntitled = hasNbmEntitlement(userEntitlements, lob)
  const [getFarmerDetails] = useLazySingleFarmerDetails()

  useEffect(() => {
    if (isEmpty(farmerDetails)) {
      navigate('/my-farmers', { replace: true })
    } else if (!checkFarmerDetails(farmerDetails)) {
      const fetchData = async () => {
        const { data: singleFarmerData } = await getFarmerDetails({
          growerIrdId: farmerDetails.growerIrdId,
          growerSapId: lob.toLowerCase() === 'lic' ? sapAccountId : farmerDetails.growerSapId
        })
        const parseSingleFarmerData = omitBy(singleFarmerData, isEmpty)
        const details = { ...farmerDetails, ...parseSingleFarmerData }
        setFarmerDetails(details)
      }
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    data: farmerOrderDetails,
    isLoading: isFarmerOrderLoading,
    isError: isFarmerOrderError,
    refetch: reftechFarmerOrderDetails
  } = useFarmerOrderDetails({
    dealerSapId: sapAccountId,
    growerSapId: farmerDetails.growerSapId || farmerDetails.growerIrdId
  })
  const {
    data: { cropZones: farmerZoneHistory = [] } = {},
    isLoading: isFarmerZoneHistoryLoading,
    isError: isFarmerZoneError,
    refetch: refetchZoneHistory
  } = useSingleFarmerDetails({
    growerIrdId: farmerDetails.growerIrdId,
    growerSapId: farmerDetails.growerSapId
  })

  const {
    data: farmerOffers,
    isLoading: isFarmerOffersLoading,
    isError: isFarmerOffersError,
    refetch: refetchFarmerOffers
  } = useFarmerOffers(farmerDetails.growerUId)

  const cropTotalsData = useCropTotals(farmerOrderDetails)
  const productsOrderedData = useProductsOrdered(farmerOrderDetails)

  const handleNominationModalClick = (_colId: string, rowId: string) => {
    const matchedOffer = farmerOffers.find((offer) => offer.id === rowId)
    if (matchedOffer) {
      setSelectedOffer(matchedOffer)
      setOpenNominationModal(true)
    } else {
      setSelectedOffer(undefined)
      setOpenNominationModal(false)
    }
  }

  const farmerOffersHeaders = farmerOffersColumns.map((c) => {
    const column = { ...c } as HeaderType<OfferTableRecord>
    if (column.displayType === 'link') {
      column.onLinkClick = (offer: OfferTableRecord) => {
        if (offer) {
          handleNominationModalClick('0', offer.id)
        }
      }
    }
    return column
  })

  const getEmptyTable = (msgKeys: MsgKeys, isLoading: boolean, isError: boolean, refetchDetails: () => void) => {
    const getMessageHeader = t(isError ? msgKeys.errorMsgHeader : msgKeys.noDataMsgHeader)
    const getMessageDescription = t(isError ? msgKeys.errorMsg : msgKeys.noDataMsg)

    return (
      <GridCol
        desktopCol={12}
        tabletCol={8}
        phoneCol={4}
        className={styles.container_contingency}
        verticalAlign='middle'
      >
        {isLoading ? (
          <Loading label={t(msgKeys.loadingMsg)} />
        ) : (
          <MessageWithAction
            messageHeader={getMessageHeader}
            messageDescription={getMessageDescription}
            primaryButtonProps={
              isError ? { label: t('common.try_again.label'), variant: 'text', onClick: refetchDetails } : undefined
            }
            iconProps={{
              icon: 'info_outline',
              variant: 'filled-secondary',
              className: 'lmnt-theme-secondary-200-bg'
            }}
          />
        )}
      </GridCol>
    )
  }

  return (
    <>
      <Grid className={styles.farmerInfoContainer}>
        <GridRow className={styles.headerRow}>
          <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
            <BackButton />
          </GridCol>
          <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
            <TypoDisplay level={4}>{getAccountName(farmerDetails)}</TypoDisplay>
          </GridCol>
        </GridRow>
      </Grid>
      <Grid className={styles.farmerInfoContainer}>
        {isNbmEntitled && (
          <FieldViewLinkButton farmerDetails={farmerDetails} refetchFarmerOffers={refetchFarmerOffers} />
        )}
      </Grid>
      <FarmerDetailsDisplay data={farmerDetails} fields={farmerDetailFields} />
      <NominationModal open={openNominationModal} setOpen={setOpenNominationModal} offer={selectedOffer} />
      <Grid className={styles.farmerInfoContainer}>
        <GridRow>
          {isNbmEntitled &&
            (farmerOffers?.length > 0 ? (
              <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
                {/*<MediaQuery minWidth={IS_DESKTOP}>*/}
                <Table<OfferTableRecord>
                  title={t('farmers.tables.farmerOffers.tableTitle')}
                  data={farmerOffers}
                  headers={farmerOffersHeaders}
                />
                {/*</MediaQuery>*/}
              </GridCol>
            ) : (
              getEmptyTable(MSG_KEYS.farmerPrograms, isFarmerOffersLoading, isFarmerOffersError, refetchFarmerOffers)
            ))}
          {cropTotalsData?.length > 0 ? (
            <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
              {/*<MediaQuery minWidth={IS_DESKTOP}>*/}
              <Table<OrderDetails>
                title={t('farmers.farmerDetails.totalTable.title')}
                data={cropTotalsData}
                headers={farmerCropTotalsColumns as HeaderType<OrderDetails>[]}
                paginated
              />
              {/*</MediaQuery>*/}
            </GridCol>
          ) : (
            getEmptyTable(MSG_KEYS.cropTotal, isFarmerOrderLoading, isFarmerOrderError, reftechFarmerOrderDetails)
          )}
          {productsOrderedData?.length > 0 ? (
            <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
              {/*<MediaQuery minWidth={IS_DESKTOP}>*/}
              <Table<OrderDetails>
                title={t('farmers.farmerDetails.table.title')}
                data={productsOrderedData}
                headers={farmerProductsOrderedColumns as HeaderType<OrderDetails>[]}
                searchable
                paginated
                noContentMessage={
                  <MessageWithAction
                    messageHeader={t('common.no_results_message_header_label')}
                    messageDescription={t('common.no_results_message_description')}
                    iconProps={{
                      icon: 'info_outline',
                      variant: 'filled-secondary',
                      className: 'lmnt-theme-secondary-200-bg'
                    }}
                  />
                }
                enableCsvDownload
                csvFileName={'My-Farmers_Products_Ordered_'}
                expandable={farmerProductsOrderedColumns?.[0]?.displayType === 'expandable'}
              />
              {/*</MediaQuery>*/}
            </GridCol>
          ) : (
            getEmptyTable(MSG_KEYS.productsOrdered, isFarmerOrderLoading, isFarmerOrderError, reftechFarmerOrderDetails)
          )}
          {portalKey === PortalKey.MyCrop &&
            (farmerZoneHistory && farmerZoneHistory.length > 0 ? (
              <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
                {/*<MediaQuery minWidth={IS_DESKTOP}>*/}
                <Table<CropZone>
                  title={t('farmers.farmerDetails.zoneTable.title')}
                  data={farmerZoneHistory}
                  headers={zoneDetailsColumns as HeaderType<CropZone>[]}
                  paginated
                />
                {/*</MediaQuery>*/}
              </GridCol>
            ) : (
              getEmptyTable(MSG_KEYS.zoneHistory, isFarmerZoneHistoryLoading, isFarmerZoneError, refetchZoneHistory)
            ))}
        </GridRow>
      </Grid>
    </>
  )
}

export default FarmerInfo
