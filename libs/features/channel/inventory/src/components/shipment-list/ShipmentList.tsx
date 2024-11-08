/* eslint-disable @nx/enforce-module-boundaries */
import styles from './ShipmentList.module.scss'
import { Loading,MessageWithAction, Table, HeaderType, TableMenu, ConfirmationModal, List, Badge } from '@gc/components'
import MediaQuery from 'react-responsive'
import { IS_DESKTOP, IS_MOBILE, resolutions } from '@gc/constants'
import { useTranslation } from 'react-i18next'
import { ShipmentDelivery, ShipmentDeliveryEntry } from '@gc/types'
import { Grid, GridRow, GridCol } from '@element/react-grid'
import { useState, useEffect } from 'react'
import ShipmentTableExpandedRowTemplate from './ShipmentTableExpandedRowTemplate'
import { useLocale, useScreenRes, useAppSessionData, useUpsertAppSessionData } from '@gc/hooks'
import { fetchStore, fasteRoute, getDateFromUTC } from '@gc/utils'
import { useGetAllShipmentDeliveriesQueries } from '@gc/redux-store'
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import _ from 'lodash'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
/* eslint-disable-next-line */
export interface ShipmentListProps {
  farmerSapId?: string[]
  tableTitle: string
  searchTerm?: string
  fasteStoreKey: string
  actionItems?: {
    value: string
    label: string
    onClick: () => void
  }[]
  dispatch?: ThunkDispatch<object, undefined, UnknownAction>
}

export function ShipmentList(props:ShipmentListProps) {
  const { t } = useTranslation()
  // const portalConfig = usePortalConfig()
  const {tableTitle, searchTerm = '' } = props
  const locale = useLocale()
  const res = useScreenRes()
  const selectedAccount = fetchStore('selectedAccount')
  const appSessionData = useAppSessionData()
  const [upsertAppSessionData] = useUpsertAppSessionData()

  const [deliveries, setDeliveries] = useState<ShipmentDelivery[]>([])
  const { useGetAllShipmentDeliveriesQuery } = useGetAllShipmentDeliveriesQueries()
  const {
    data = [],
    error,
    isFetching,
    isLoading
  } = useGetAllShipmentDeliveriesQuery({
    isMobile: res <= resolutions.M1023,
    reqBody: {
      salesYear: ['2024','2025'], //TODO: Pull data from config
      documentTypes: ['ZBS1','ZUOR','ZU3L','YPLF','ZU3O'], //TODO: Pull data from config
      status: ['DELIVERED','STAGED','CONFIRMED'],
      farmerSapId: ['0009222320',
        '0009146406',
        '0009221009',
        '0009222320',
        '0001008596',
        '0001008596',
        '0009222320'], //TODO: pass the only needed farmer Sap id(s)
      agentSapId: [
        '0009222320',
        '0009222320',
        '0009146406',
        '0009221009',
        '0009222320',
        '0009221009',
        '0001008596',
        '0009146406'
    ] //TODO: pass the right values
    },
    updatePartialDeliveries: (deliveries: ShipmentDelivery[]) => {
      setDeliveryData(deliveries)
      setShowLoader(false)
    }
  })
  const [showLoader, setShowLoader] = useState(deliveries.length === 0 && isFetching)
  const [showError, setShowError] = useState(false)

  const emptyConformationModal = {
    open: false,
    title: '',
    primaryButtonProps: { text: '' },
    dismissiveButtonProps: { text: '' },
    message: '',
    onConfirmation: () => {console.log('On Confirmation')}
  }
  const [modalState, setModalState] = useState(emptyConformationModal)

  const headerData: HeaderType<ShipmentDelivery>[] = [
    {
      header: t('inventory.shipments.delivery_id.label'),
      accessor: 'code',
      id: 'code', // It's required for default sorting
      defaultSort: 'desc'
    },
    {
      header: t('inventory.shipments.shipment_id.label'),
      accessor: 'shipmentId',
    },
    { header: t('inventory.shipments.line_of_business.label'), accessor: 'lineOfBusiness', filterable: true },
    { header: `${t('common.ship.label')} ${t('common.to.label')}`, accessor: 'shipToAddress.town', filterable: true },
    { header: t('inventory.shipments.planned_ship_date.label'), accessor: 'formattedPlannedShipDate' },
    {
      header: `${t('deliveries.delivery.label')} ${t('common.status.label')}`  ,
      accessor: 'statusText',
      filterable: true
    }
  ]

  useEffect(() => {
    const existingAppSessionData = _.get(appSessionData, `${props.fasteStoreKey}`)
    if (!existingAppSessionData?.sortBy) {
      upsertAppSessionData(props.fasteStoreKey, {
        sortBy: [{ id: 'code', desc: true }]
      })
    }
  }, [appSessionData, props.fasteStoreKey, upsertAppSessionData])

  const setDeliveryData = (data: ShipmentDelivery[]) => {
    const deliveryData = data.map((delivery: ShipmentDelivery) => ({
      ...delivery,
      formattedPlannedShipDate: getDateFromUTC(new Date(delivery.plannedShipDate), locale),
    }))
    setDeliveries(deliveryData)
  }

  useEffect(() => {
    if (!isLoading && !isFetching) {
      if (data && !error) {
        setDeliveryData(data)
      }
      if (error) {
        setShowError(true)
      }
      setShowLoader(false)
    }
  }, [isLoading, error, data, isFetching, locale])

  const goToTrackShipment = () => {
    //TODO: redirect to correct route.
  }
  const goToShipmentDetails = (shipmentId: string) => {
    fasteRoute(`/inventory/shipments/${shipmentId}`)
  }

  const searchFun = (delivery: ShipmentDelivery, searchStr: string) => {
    const hits = (value: string) => value?.toLowerCase().includes(searchStr)
    const matchingDelivery = (delivery: ShipmentDelivery) =>
      hits(delivery.code) ||
      hits(delivery.shipmentId || '') ||
      hits(delivery.status) ||
      hits(delivery.statusText) ||
      hits(delivery.lineOfBusiness) ||
      hits(delivery.plannedShipDate) ||
      hits(delivery.shipToAddress?.firstName || '') ||
      hits(delivery.shipToAddress?.lastName || '') ||
      hits(delivery.shipToAddress?.formattedAddress || '') ||
      hits(delivery.fromWarehouse?.formattedAddress || '') ||
      hits(delivery.fromWarehouse?.town || '') ||
      (delivery.entries ? delivery.entries.some(matchingEntry) : false)
    const matchingEntry = (entry: ShipmentDeliveryEntry) =>
      hits(entry.product.name) ||
      hits(entry.quantity?.toString()) ||
      hits(entry.salesUnitOfMeasureCode) ||
      hits(entry.batchName) ||
      hits(entry.seedSize || '')
    return matchingDelivery(delivery)
  }
  const dataToListItem = (shipmentDelivery: ShipmentDelivery) => ({
    code: shipmentDelivery.code,
    overlineText: shipmentDelivery.statusText && (
      <div className={styles['overline-text-wrapper']}>
        <Badge labelText={shipmentDelivery.statusText} />
      </div>
    ),
    primaryText: (
      <TypoSubtitle level={2}>
        {`${t('deliveries.delivery.label')} ${shipmentDelivery.code}`}
      </TypoSubtitle>
    ),
    secondaryText: (
      <>
        <TypoCaption>{`${t('inventory.shipments.shipment.label')} ${shipmentDelivery.shipmentId || ''}`}</TypoCaption>
          <br/>
        <TypoCaption>{`${t('common.to.label')} ${shipmentDelivery.shipToAddress?.town || ''}`}</TypoCaption>
      </>
    )
  })

  return (
    <>
      <Grid className={styles.grid}>
        <GridRow className={styles.content}>
          <GridCol
            desktopCol={12}
            phoneCol={4}
            tabletCol={8}
            verticalAlign={!deliveries.length || showError ? 'middle' : 'top'}
            className={
              (!deliveries.length && searchTerm.trim().length === 0) || showError ? styles['container-contingency'] : ''
            }
          >
            {showLoader || showError ? (
              showLoader ? (
                <Loading label={t('inventory.shipments.loading_shipments.label')} />
              ) : (
                <MessageWithAction
                  messageHeader={t('deliveries.error_msg_header.label')}
                  messageDescription={t('common.error_msg_description.label')}
                  iconProps={{
                    icon: 'info_outline',
                    variant: 'filled-secondary',
                    className: 'lmnt-theme-secondary-200-bg'
                  }}
                  primaryButtonProps={{
                    label: t('common.refresh.label'),
                    variant: 'text',
                    onClick: () => {
                      setShowLoader(true)
                      setShowError(false)
                      setDeliveries([])
                    }
                  }}
                />
              )
            ) : !deliveries.length && searchTerm.trim().length === 0 ? (
              <MessageWithAction
                messageHeader={t('inventory.shipments.no_data_header.msg')}
                messageDescription={t('inventory.shipments.no_data_description.msg')}
                iconProps={{
                  icon: 'info_outline',
                  variant: 'filled-secondary',
                  className: 'lmnt-theme-secondary-200-bg'
                }}
              />
            ) : (
              
                <><MediaQuery minWidth={IS_DESKTOP}>
                    <Table<ShipmentDelivery>
                      title={tableTitle}
                      data={deliveries}
                      className={styles.deliveries_table}
                      headers={headerData}
                      noContentMessage={<MessageWithAction
                        messageHeader={t('common.no_matching_results_message_header_label')}
                        messageDescription={t('inventory.shipments.no_matching_results_description.msg')}
                        iconProps={{
                          icon: 'info_outline',
                          variant: 'filled-secondary',
                          className: 'lmnt-theme-secondary-200-bg'
                        }} />}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      expandedRowTemplate={({ row }: any) => (
                        <div id='deliveries_expansion_panel' className={styles.deliveries_expansion_panel}>
                          <ShipmentTableExpandedRowTemplate
                            delivery={row.original}
                            trackShipment={() => goToTrackShipment()} />
                        </div>
                      )}
                      paginated
                      searchable
                      enableCsvDownload
                      customSearchFn={searchFun}
                      fasteStoreKey={props.fasteStoreKey} />
                  </MediaQuery><MediaQuery maxWidth={IS_MOBILE}>
                    <div className={styles['order-list-mobile']}>
                      {deliveries.length > 0 ? (
                        <List<ShipmentDelivery>
                          items={[]} // TODO refactor List component to make items optional when data and dataToListItem is given!!
                          divider={true}
                          onAction={goToShipmentDetails}
                          data={deliveries}
                          searchTerm={searchTerm}
                          searchFn={searchFun}
                          fasteStoreKey={props.fasteStoreKey}
                          dataToListItem={dataToListItem} 
                          filterProps={{
                            filters: [
                              { title: t('inventory.shipments.line_of_business.label'), accessor: 'lineOfBusiness' },
                              { title: `${t('deliveries.delivery.label')} ${t('common.status.label')}`, accessor: 'statusText' },
                              { title: t('common.warehouse.label'), accessor: 'shipToAddress.town' }
                            ]
                          }}
                          />
                      ) : (
                        <MessageWithAction
                          messageHeader={t('common.no_results_message_header_label')}
                          messageDescription={t('common.no_results_message_description')}
                          iconProps={{
                            icon: 'info_outline',
                            variant: 'filled-secondary',
                            className: 'lmnt-theme-secondary-200-bg'
                          }} />
                      )}
                      </div>
                    </MediaQuery></>
            )}
          </GridCol>
        </GridRow>
      </Grid>
      <ConfirmationModal
        {...modalState}
        handleClose={() => {
          setModalState(emptyConformationModal)
        }}
      />
    </>
  )
}

export default ShipmentList
