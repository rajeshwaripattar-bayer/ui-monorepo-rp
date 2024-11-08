import styles from './ReturnList.module.scss'
import { Loading } from '../../ui-common/loading/Loading'
import { MessageWithAction } from '../../ui-common/message-with-action/MessageWithAction'
import { Badge } from '../../ui-common/badge/Badge'
import { Table, HeaderType } from '../../ui-common/table/Table'
import { List } from '../../ui-common/list/List'
import MediaQuery from 'react-responsive'
import { IS_MOBILE, IS_DESKTOP, resolutions, space } from '@gc/constants'
import { useTranslation } from 'react-i18next'
import { ChannelOrderEntry, ChannelOrder } from '@gc/types'
import { Grid, GridRow, GridCol } from '@element/react-grid'
import { useState, useEffect } from 'react'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import ReturnsTableExpandedRowTemplate from './ReturnsTableExpandedRowTemplate'
import { useScreenRes, useAppSessionData, useUpsertAppSessionData } from '@gc/hooks'
import { fetchStore } from '@gc/utils'
import { useOrdersQueries } from '@gc/redux-store'
import { fasteRoute } from '@gc/utils'
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import _ from 'lodash'

/* eslint-disable-next-line */
export interface ReturnListProps {
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

export function ReturnList(props: ReturnListProps) {
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
      documentTypes: ['ZU3R'],
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

  const headerData: HeaderType<ChannelOrder>[] = [
    ...(showFarmerNameColumn
      ? [{ header: t('common.farmer_name.label'), accessor: 'growerInfo.name', sortType: 'basic' }]
      : []),
    {
      header: t('returns.return_id.label'),
      accessor: 'orderNumber',
      id: 'orderNumber', // It's required for default sorting
      defaultSort: 'desc'
    },

    {
      header: t('common.date_created.label'),
      accessor: 'created',
      displayTemplate: (date: string) => (date ? new Date(date).toLocaleDateString() : '')
    },

    {
      header: t('common.status.label'),
      accessor: 'statusText',
      displayType: 'custom',
      displayTemplate: (status: string) => (status ? <Badge labelText={status} /> : ''),
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
        setOrders(data as ChannelOrder[])
      }
      if (error) {
        setShowError(true)
      }
      setShowLoader(false)
    }
  }, [isLoading, error, data, isFetching])

  const goToReturnDetails = (code: string) => {
    fasteRoute(`/farmers/returns/${code}`, { code })
  }

  const searchFun = (order: ChannelOrder, searchStr: string) => {
    const hits = (value: string) => value?.toLowerCase().includes(searchStr)
    const matchingOrder = (order: ChannelOrder) =>
      hits(order.orderNumber) ||
      hits(order.growerInfo?.name) ||
      hits(order.created) ||
      hits(order.name) ||
      hits(order.statusText) ||
      hits(order.totalPriceWithTax?.value.toString()) ||
      hits(order.totalPrice?.value.toString()) ||
      order.entries?.some(matchingEntry)
    const matchingEntry = (entry: ChannelOrderEntry) => hits(entry.product?.name) || hits(entry.quantity?.toString())
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
        {showFarmerNameColumn ? order.growerInfo?.name : `${t('farmers.return.label')} ${order.orderNumber}`}
      </TypoSubtitle>
    ),
    secondaryText: (
      <>
        {showFarmerNameColumn ? (
          <TypoCaption>{`${t('farmers.return.label')} ${order.orderNumber}`}</TypoCaption>
        ) : (
          <TypoCaption>
            {order.entries.length}
            {space}
            {t('common.product.label', {
              count: order.entries.length
            })}
          </TypoCaption>
        )}
        {order.name && order.name !== '' && (
          <>
            {showFarmerNameColumn && <br />}
            <TypoCaption>{order.name}</TypoCaption>
          </>
        )}
      </>
    )
  })

  return (
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
              <Loading label={t('returns.loading_returns_message.label')} />
            ) : (
              <MessageWithAction
                messageHeader={t('returns.error_msg_header.label')}
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
              messageHeader={t('returns.no_returns_message_header.label')}
              messageDescription={t('returns.no_returns_message.description')}
              iconProps={{
                icon: 'info_outline',
                variant: 'filled-secondary',
                className: 'lmnt-theme-secondary-200-bg'
              }}
              primaryButtonProps={{
                label: t('returns.create_return.label'),
                variant: 'text'
              }}
            />
          ) : (
            <>
              <MediaQuery minWidth={IS_DESKTOP}>
                <Table<ChannelOrder>
                  title={tableTitle}
                  data={orders}
                  className={styles.returns_table}
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
                    <div id='returns_expansion_panel' className={styles.returns_expansion_panel}>
                      <ReturnsTableExpandedRowTemplate order={row.original} />
                    </div>
                  )}
                  paginated
                  searchable
                  customSearchFn={searchFun}
                  fasteStoreKey={props.fasteStoreKey}
                />
              </MediaQuery>
              <MediaQuery maxWidth={IS_MOBILE}>
                <div className={styles['returns_list_mobile']}>
                  {orders.length > 0 ? (
                    <List<ChannelOrder>
                      items={[]} // TODO refactor List component to make items optional when data and dataToListItem is given!!
                      divider={true}
                      onAction={goToReturnDetails}
                      data={orders}
                      filterProps={{
                        filters: [{ title: 'Status', accessor: 'statusText' }]
                      }}
                      sortProps={{
                        options: [
                          { label: t('common.return_id_z-a.label'), columnName: 'code', sortingType: 'desc' },
                          { label: t('common.return_id_a-z.label'), columnName: 'code', sortingType: 'asc' }
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
  )
}

export default ReturnList