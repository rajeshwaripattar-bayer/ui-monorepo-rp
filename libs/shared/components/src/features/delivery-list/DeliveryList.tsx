import styles from './DeliveryList.module.scss'
import { Loading } from '../../ui-common/loading/Loading'
import { MessageWithAction } from '../../ui-common/message-with-action/MessageWithAction'
import { Badge } from '../../ui-common/badge/Badge'
import { Table, HeaderType } from '../../ui-common/table/Table'
import { List } from '../../ui-common/list/List'
import MediaQuery from 'react-responsive'
import { IS_MOBILE, IS_DESKTOP, resolutions, space, interpunct } from '@gc/constants'
import { useTranslation } from 'react-i18next'
import { Delivery, DeliveryEntry } from '@gc/types'
import { Grid, GridRow, GridCol } from '@element/react-grid'
import { useState, useEffect } from 'react'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import DeliveryTableExpandedRowTemplate from './DeliveryTableExpandedRowTemplate'
import { useLocale, useScreenRes, useAppSessionData, useUpsertAppSessionData } from '@gc/hooks'
import { fetchStore, fasteRoute, getDateFromUTC } from '@gc/utils'
import { useDeliveriesQueries } from '@gc/redux-store'
import ConfirmationModal from '../../ui-common/modal/ConfirmationModal'
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import _ from 'lodash'

/* eslint-disable-next-line */
export interface DeliveryListProps {
  farmerSapId?: string[]
  tableTitle: string
  searchTerm?: string
  fasteStoreKey: string
  showFarmerNameColumn?: boolean
  actionItems?: {
    value: string
    label: string
    onClick: () => void
  }[]
  dispatch?: ThunkDispatch<object, undefined, UnknownAction>
  handleCreateDelivery?: () => void
}

export function DeliveryList(props: DeliveryListProps) {
  const { t } = useTranslation()
  // const portalConfig = usePortalConfig()
  const { showFarmerNameColumn, tableTitle, searchTerm = '' } = props
  const locale = useLocale()
  const res = useScreenRes()
  const selectedAccount = fetchStore('selectedAccount')
  const appSessionData = useAppSessionData()
  const [upsertAppSessionData] = useUpsertAppSessionData()

  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const { useGetAllDeliveriesQuery } = useDeliveriesQueries()
  const {
    data = [],
    error,
    isFetching,
    isLoading,
    refetch
  } = useGetAllDeliveriesQuery({
    isMobile: res <= resolutions.M1023,
    reqBody: {
      salesYear: ['2024', '2025'], //TODO: Pull data from config
      documentTypes: ['ZBS1', 'ZUOR', 'ZU3L', 'YPLF', 'ZU3O'], //TODO: Pull data from config
      status: [],
      farmerSapId: [selectedAccount.sapAccountId, '0009222320', '0009146406', '0009221009', '0009222320', '0001008596'], //TODO: pass the only needed farmer Sap id(s)
      agentSapId: [] //TODO: pass the right values
    },
    updatePartialDeliveries: (deliveries: Delivery[]) => {
      setDeliveries(deliveries)
      setShowLoader(false)
    }
  })
  const [showLoader, setShowLoader] = useState(deliveries.length === 0 && isFetching)
  const [showError, setShowError] = useState(!!error)

  const emptyConformationModal = {
    open: false,
    title: '',
    primaryButtonProps: { text: '' },
    dismissiveButtonProps: { text: '' },
    message: '',
    onConfirmation: () => {}
  }
  const [modalState, setModalState] = useState(emptyConformationModal)

  const headerData: HeaderType<Delivery>[] = [
    ...(showFarmerNameColumn ? [{ header: t('common.farmer_name.label'), accessor: 'code', sortType: 'basic' }] : []),
    {
      header: `${t('deliveries.delivery.label')} #`,
      accessor: 'code',
      id: 'code', // It's required for default sorting
      defaultSort: 'desc'
    },
    {
      header: t('common.order_number.label'),
      accessor: 'displaySalesOrderId',
      displayType: 'link',
      onLinkClick: (delivery: Delivery) => goToOrderDetails(delivery.salesOrderId)
    },
    { header: t('farmers.signature.label'), accessor: '' },
    { header: t('farmers.delivery_date.label'), accessor: 'formattedDeliveryDate' },
    {
      header: t('common.status.label'),
      accessor: 'statusText',
      displayType: 'custom',
      displayTemplate: (statusText: string) => (statusText ? <Badge labelText={statusText} /> : ''),
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

  useEffect(() => {
    if (!isLoading && !isFetching) {
      if (data && !error) {
        const deliveryData = data.map((delivery: Delivery) => ({
          ...delivery,
          formattedDeliveryDate: getDateFromUTC(new Date(delivery.createdOnDateTime), locale),
          displaySalesOrderId:
            delivery.salesOrderId.indexOf('-') > 0 ? delivery.salesOrderId.split('-')[1] : delivery.salesOrderId
        }))
        setDeliveries(deliveryData)
      }
      if (error) {
        setShowError(true)
      }
      setShowLoader(false)
    }
  }, [isLoading, error, data, isFetching, locale])

  const goToDeliveryDetails = (code: string) => {
    fasteRoute(`/farmers/deliveries/${code}`, { code })
  }
  const goToOrderDetails = (code: string) => {
    fasteRoute(`/orders/${code}`)
  }

  const handleGoodsIssue = (code: string) => {
    //TODO: handle click of GoodsIssue
  }
  const searchFun = (delivery: Delivery, searchStr: string) => {
    const hits = (value: string) => value?.toLowerCase().includes(searchStr)
    const matchingDelivery = (delivery: Delivery) =>
      hits(delivery.code) ||
      hits(delivery.salesOrderId) ||
      hits(delivery.statusText) ||
      hits(delivery.formattedDeliveryDate) ||
      delivery.entries?.some(matchingEntry)
    const matchingEntry = (entry: DeliveryEntry) =>
      hits(entry.product.name) ||
      hits(entry.quantity?.toString()) ||
      hits(entry.warehouse?.name) ||
      hits(entry.batchName) ||
      hits(entry.seedSize)
    return matchingDelivery(delivery)
  }

  const dataToListItem = (delivery: Delivery) => ({
    code: delivery.code,
    trailingBlock: (
      <TypoCaption>
        {t('deliveries.short_delivery_date.label')}
        {space}
        {getDateFromUTC(new Date(delivery.createdOnDateTime), locale)}
      </TypoCaption>
    ),
    overlineText: delivery.statusText && (
      <div className={styles['overline-text-wrapper']}>
        <Badge labelText={delivery.statusText} />
      </div>
    ),
    primaryText: (
      <TypoSubtitle level={2}>
        {showFarmerNameColumn ? delivery.farmerId : `${t('deliveries.delivery.label')} ${delivery.code}`}
      </TypoSubtitle>
    ),
    secondaryText: (
      <>
        {showFarmerNameColumn && <TypoCaption>{`${t('deliveries.delivery.label')} ${delivery.code}`}</TypoCaption>}
        {delivery.farmerId && delivery.farmerId !== '' && (
          <>
            {showFarmerNameColumn && <br />}
            <TypoCaption>{delivery.farmerId}</TypoCaption>
          </>
        )}
        <TypoCaption>
          {t('orders.order.label')}
          {space}
          {delivery.salesOrderId.indexOf('-') > 0 ? delivery.salesOrderId.split('-')[1] : delivery.salesOrderId}
        </TypoCaption>{' '}
        <br />
        {delivery.notCancelledEntriesCount && (
          <TypoCaption>
            {delivery.notCancelledEntriesCount}
            {space}
            {t('common.product.label', {
              count: delivery.notCancelledEntriesCount
            })}
          </TypoCaption>
        )}
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
                <Loading label={t('deliveries.loading_deliveries_message.label')} />
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
                    label: t('common.try_again.label'),
                    variant: 'text',
                    onClick: () => {
                      setShowLoader(true)
                      setShowError(false)
                      setDeliveries([])
                      refetch()
                    }
                  }}
                />
              )
            ) : !deliveries.length && searchTerm.trim().length === 0 ? (
              <MessageWithAction
                messageHeader={t('deliveries.no_deliveries_message_header.label')}
                messageDescription={t('deliveries.no_deliveries_message.description')}
                iconProps={{
                  icon: 'info_outline',
                  variant: 'filled-secondary',
                  className: 'lmnt-theme-secondary-200-bg'
                }}
                primaryButtonProps={{
                  label: t('deliveries.create_delivery.label'),
                  variant: 'text',
                  onClick: () => {}
                }}
              />
            ) : (
              <>
                <MediaQuery minWidth={IS_DESKTOP}>
                  <Table<Delivery>
                    title={tableTitle}
                    data={deliveries}
                    className={styles.deliveries_table}
                    headers={headerData}
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    expandedRowTemplate={({ row }: any) => (
                      <div id='deliveries_expansion_panel' className={styles.deliveries_expansion_panel}>
                        <DeliveryTableExpandedRowTemplate
                          delivery={row.original}
                          onClickGoodsIssue={() => handleGoodsIssue((row.original as Delivery).code)}
                        />
                      </div>
                    )}
                    paginated
                    searchable
                    customSearchFn={searchFun}
                    fasteStoreKey={props.fasteStoreKey}
                  />
                </MediaQuery>
                <MediaQuery maxWidth={IS_MOBILE}>
                  <div className={styles['delivery-list-mobile']}>
                    {deliveries.length > 0 ? (
                      <List<Delivery>
                        items={[]} // TODO refactor List component to make items optional when data and dataToListItem is given!!
                        divider={true}
                        onAction={goToDeliveryDetails}
                        data={deliveries}
                        filterProps={{
                          filters: [
                            { title: `${t('common.status.label')}`, accessor: 'statusText' },
                            { title: `${t('farmers.signature.label')}`, accessor: '' }
                          ]
                        }}
                        sortProps={{
                          options: [
                            {
                              label: t('common.delivery_date_new-old.label'),
                              columnName: 'createdOnDateTime',
                              sortingType: 'desc'
                            },
                            {
                              label: t('common.delivery_date_old-new.label'),
                              columnName: 'createdOnDateTime',
                              sortingType: 'asc'
                            }
                          ]
                        }}
                        searchTerm={searchTerm}
                        searchFn={searchFun}
                        fasteStoreKey={props.fasteStoreKey}
                        dataToListItem={dataToListItem}
                      />
                    ) : (
                      <MessageWithAction
                        messageHeader={t('common.no_results_message_header_label')}
                        messageDescription={t('common.no_results_message_description')}
                        iconProps={{
                          icon: 'info_outline',
                          variant: 'filled-secondary',
                          className: 'lmnt-theme-secondary-200-bg'
                        }}
                      />
                    )}
                  </div>
                </MediaQuery>
              </>
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

export default DeliveryList
