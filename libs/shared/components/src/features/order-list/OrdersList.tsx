import styles from './OrdersList.module.scss'
import { Loading } from '../../ui-common/loading/Loading'
import { MessageWithAction } from '../../ui-common/message-with-action/MessageWithAction'
import { Badge } from '../../ui-common/badge/Badge'
import { Table, HeaderType } from '../../ui-common/table/Table'
import { List } from '../../ui-common/list/List'
import MediaQuery from 'react-responsive'
import { IS_MOBILE, IS_DESKTOP, resolutions, space, interpunct } from '@gc/constants'
import { useTranslation } from 'react-i18next'
import { ChannelOrderEntry, ChannelOrder } from '@gc/types'
import { Grid, GridRow, GridCol } from '@element/react-grid'
import { useState, useEffect } from 'react'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import OrdersTableExpandedRowTemplate from './OrdersTableExpandedRowTemplate'
// import { usePortalConfig, useScreenRes } from '@gc/hooks'
import { useScreenRes, useAppSessionData, useUpsertAppSessionData } from '@gc/hooks'
import { fetchStore } from '@gc/utils'
import TableMenu from '../../ui-common/table/TableMenu'
import ConfirmationModal from '../../ui-common/modal/ConfirmationModal'
import { fasteRoute } from '@gc/utils'
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import { useOrdersQueries } from '@gc/redux-store'
import _, { noop } from 'lodash'

/* eslint-disable-next-line */
export interface OrdersListProps {
  soldToAccounts?: string[]
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
  handleCreateOrder?: () => void
}

export function OrdersList(props: OrdersListProps) {
  const { t } = useTranslation()
  // const portalConfig = usePortalConfig()
  const { showFarmerNameColumn, tableTitle, soldToAccounts, searchTerm = '' } = props
  const res = useScreenRes()
  const selectedAccount = fetchStore('selectedAccount')
  const appSessionData = useAppSessionData()
  const [upsertAppSessionData] = useUpsertAppSessionData()
  const [orders, setOrders] = useState<ChannelOrder[]>([])
  const { useGetAllOrdersQuery } = useOrdersQueries()
  const {
    data = [],
    error,
    isFetching,
    isLoading,
    refetch
  } = useGetAllOrdersQuery({
    isMobile: res <= resolutions.M1023,
    reqBody: {
      pageSize: 100,
      documentTypes: ['ZU3O'],
      agents: [selectedAccount.sapAccountId],
      ...(soldToAccounts ? { soldToAccounts } : {})
    },
    updatePartialOrders: (orders: ChannelOrder[]) => {
      setOrders(orders)
      setShowLoader(false)
    }
  })
  const [showLoader, setShowLoader] = useState(orders.length === 0 && isFetching)
  const [showError, setShowError] = useState(!!error)

  const emptyConformationModal = {
    open: false,
    title: '',
    primaryButtonProps: { text: '' },
    dismissiveButtonProps: { text: '' },
    message: '',
    onConfirmation: noop
  }
  const [modalState, setModalState] = useState(emptyConformationModal)
  // const orderActions = []
  // useQuoteActions(
  //   ['viewDetails', 'edit', 'cancelOrder', 'downloadFarmerStatement', 'shareWithFarmer'],
  //   setModalState,
  //   props.dispatch
  // )

  const headerData: HeaderType<ChannelOrder>[] = [
    ...(showFarmerNameColumn
      ? [{ header: t('common.farmer_name.label'), accessor: 'growerInfo.name', sortType: 'basic' }]
      : []),
    {
      header: t('orders.order_id.label'),
      accessor: 'orderNumber',
      id: 'orderNumber', // It's required for default sorting
      displayType: 'link',
      onLinkClick: (order: ChannelOrder) => goToOrderDetails(order.code),
      defaultSort: 'desc'
    },
    { header: t('common.sales_year.label'), accessor: 'salesYear', filterable: true },
    {
      header: t('orders.order_name.label'),
      accessor: 'name',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sortType: (x: any, y: any) => {
        const a: string = x.original.name ? x.original.name : ''
        const b: string = y.original.name ? y.original.name : ''
        return a.localeCompare(b)
      }
    },
    {
      header: t('common.status.label'),
      accessor: 'statusText',
      displayType: 'custom',
      displayTemplate: (status: string) => (status ? <Badge labelText={status} /> : ''),
      filterable: true
    },
    {
      header: t('common.actions.label'),
      accessor: (_data: ChannelOrder) => <TableMenu<ChannelOrder> listItems={[]} currentRow={_data} />,
      disableSortBy: true,
      align: 'center'
    }
  ]

  useEffect(() => {
    const existingAppSessionData = _.get(appSessionData, `${props.fasteStoreKey}`)
    if (!existingAppSessionData?.sortBy) {
      upsertAppSessionData(props.fasteStoreKey, {
        sortBy: [{ id: 'orderNumber', desc: true }]
      })
    }
  }, [appSessionData, props.fasteStoreKey, upsertAppSessionData])

  useEffect(() => {
    if (!isLoading && !isFetching) {
      if (data && !error) {
        setOrders(data as ChannelOrder[])
      }
      if (error) {
        setShowError(true)
      }
      setShowLoader(false)
    }
  }, [isLoading, error, data, isFetching])

  const goToOrderDetails = (code: string) => {
    fasteRoute(`/orders/${code}`)
  }

  const searchFun = (order: ChannelOrder, searchStr: string) => {
    const hits = (value: string) => value?.toLowerCase().includes(searchStr)
    const matchingOrder = (order: ChannelOrder) =>
      hits(order.code) ||
      hits(order.growerInfo?.name) ||
      hits(order.salesYear) ||
      hits(order.name) ||
      hits(order.statusText) ||
      hits(order.totalPriceWithTax?.value.toString()) ||
      hits(order.totalPrice?.value.toString()) ||
      order.entries?.some(matchingEntry)
    const matchingEntry = (entry: ChannelOrderEntry) => hits(entry.product?.name) || hits(entry.netQuantity?.toString())
    return matchingOrder(order)
  }

  const dataToListItem = (order: ChannelOrder) => ({
    code: order.code,
    overlineText: order.statusText && (
      <div className={styles['overline-text-wrapper']}>
        <Badge labelText={order.statusText} />
      </div>
    ),
    primaryText: (
      <TypoSubtitle level={2}>
        {showFarmerNameColumn ? order.growerInfo?.name : `${t('orders.order.label')} ${order.code}`}
        {order.name && order.name !== '' && showFarmerNameColumn && `${interpunct}${order.name}`}
      </TypoSubtitle>
    ),
    secondaryText: (
      <>
        {showFarmerNameColumn && (
          <>
            <TypoCaption>{`${t('orders.order.label')} ${order.code}`}</TypoCaption>
            <br />
          </>
        )}
        {order.name && order.name !== '' && !showFarmerNameColumn && (
          <>
            <TypoCaption>{order.name}</TypoCaption>
            <br />
          </>
        )}
        <TypoCaption>
          {order.entries.length}
          {space}
          {t('common.product.label', {
            count: order.entries.length
          })}
        </TypoCaption>
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
            verticalAlign={!orders.length || showError ? 'middle' : 'top'}
            className={
              (!orders.length && searchTerm.trim().length === 0) || showError ? styles['container-contingency'] : ''
            }
          >
            {showLoader || showError ? (
              showLoader ? (
                <Loading label={t('orders.loading_orders_message.label')} />
              ) : (
                <MessageWithAction
                  messageHeader={t('orders.error_msg_header.label')}
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
                      setOrders([])
                      refetch()
                    }
                  }}
                />
              )
            ) : !orders.length && searchTerm.trim().length === 0 ? (
              <MessageWithAction
                messageHeader={t('orders.no_orders_message_header.label')}
                messageDescription={t('orders.no_orders_message.description')}
                iconProps={{
                  icon: 'info_outline',
                  variant: 'filled-secondary',
                  className: 'lmnt-theme-secondary-200-bg'
                }}
                primaryButtonProps={{
                  label: t('orders.create_order.label'),
                  variant: 'text',
                  onClick: noop
                }}
              />
            ) : (
              <>
                <MediaQuery minWidth={IS_DESKTOP}>
                  <Table<ChannelOrder>
                    title={tableTitle}
                    data={orders}
                    className={styles.orders_table}
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
                      <div id='orders_expansion_panel' className={styles.orders_expansion_panel}>
                        {/* <ExpandedRowTemplate
                          order={row.original}
                          buttonProps={[
                            {
                              label: t('orders.view_order_details.label'),
                              onClick: () => goToOrderDetails((row.original as ChannelOrder).code),
                              variant: 'outlined'
                            }
                          ]}
                        /> */}
                        <OrdersTableExpandedRowTemplate
                          order={row.original}
                          handleViewOrderDetails={() => goToOrderDetails((row.original as ChannelOrder).code)}
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
                  <div className={styles['order-list-mobile']}>
                    {orders.length > 0 ? (
                      <List<ChannelOrder>
                        items={[]} // TODO refactor List component to make items optional when data and dataToListItem is given!!
                        divider={true}
                        onAction={goToOrderDetails}
                        data={orders}
                        filterProps={{
                          filters: [
                            { title: t('common.status.label'), accessor: 'statusText' },
                            { title: t('common.sales_year.label'), accessor: 'salesYear' }
                          ]
                        }}
                        sortProps={{
                          options: [
                            { label: t('common.order_id_a-z.label'), columnName: 'code', sortingType: 'asc' },
                            { label: t('common.order_id_z-a.label'), columnName: 'code', sortingType: 'desc' },
                            {
                              label: t('common.farmer_name_a-z.label'),
                              columnName: 'growerInfo.name',
                              sortingType: 'asc'
                            },
                            {
                              label: t('common.farmer_name_z-a.label'),
                              columnName: 'growerInfo.name',
                              sortingType: 'desc'
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

export default OrdersList
