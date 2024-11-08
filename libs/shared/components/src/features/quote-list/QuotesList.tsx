/* eslint-disable @nx/enforce-module-boundaries */

import { Grid, GridCol, GridRow } from '@element/react-grid'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import { IS_DESKTOP, IS_MOBILE, resolutions, space } from '@gc/constants'
import { useAppSessionData, usePortalConfig, useQuoteActions, useScreenRes, useUpsertAppSessionData } from '@gc/hooks'
import { useQuotesQueries } from '@gc/redux-store'
import { Quote, QuoteActionType, QuoteEntry } from '@gc/types'
import { fasteRoute, fetchStore } from '@gc/utils'
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MediaQuery from 'react-responsive'
import { Badge } from '../../ui-common/badge/Badge'
import { List } from '../../ui-common/list/List'
import { Loading } from '../../ui-common/loading/Loading'
import { MessageWithAction } from '../../ui-common/message-with-action/MessageWithAction'
import ConfirmationModal from '../../ui-common/modal/ConfirmationModal'
import { HeaderType, Table } from '../../ui-common/table/Table'
import TableMenu from '../../ui-common/table/TableMenu'
import styles from './QuotesList.module.scss'
import QuotesTableExpandedRowTemplate from './QuotesTableExpandedRowTemplate'

export interface QuotesListProps {
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
  handleCreateQuote?: () => void
}

export function QuotesList(props: QuotesListProps) {
  const { t } = useTranslation()
  const portalConfig = usePortalConfig()
  const { showFarmerNameColumn, tableTitle, soldToAccounts, searchTerm = '', handleCreateQuote } = props
  const res = useScreenRes()
  const selectedAccount = fetchStore('selectedAccount')
  const appSessionData = useAppSessionData()
  const [upsertAppSessionData] = useUpsertAppSessionData()
  const { useGetAllQuotesQuery } = useQuotesQueries()
  const {
    data = [],
    error,
    isFetching,
    isLoading,
    refetch
  } = useGetAllQuotesQuery({
    params: { pageSize: portalConfig?.gcPortalConfig.quotesPageSize || 50 },
    isMobile: res <= resolutions.M1023,
    reqBody: {
      statuses: ['BUYER_DRAFT', 'BUYER_SUBMITTED', 'BUYER_ORDERED'],
      salesYear: portalConfig.gcPortalConfig.salesYear,
      agentSAPAccounts: [selectedAccount.sapAccountId], // Logged user's selected SAP Account Id
      ...(soldToAccounts ? { soldToAccounts } : {}) // Selected Farmer's SAP ID
    },
    updatePartialQuotes: (quotes: Quote[]) => {
      setQuotes(quotes)
      setShowLoader(false)
    }
  })
  const [quotes, setQuotes] = useState<Quote[]>(data || [])
  const [showLoader, setShowLoader] = useState(quotes.length === 0 && (isFetching || isLoading))
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
  const pgQuoteActions: QuoteActionType[] = portalConfig?.quotesModule.quoteActions
  const quoteActions = useQuoteActions(pgQuoteActions, setModalState, props.dispatch)

  // All sortable columns need an id
  const headerData: HeaderType<Quote>[] = [
    ...(showFarmerNameColumn
      ? [
          {
            header: t('common.farmer_name.label'),
            accessor: 'farmer.name',
            id: 'farmer.name',
            sortType: 'basic'
          }
        ]
      : []),
    {
      header: t('quotes.quote_id.label'),
      accessor: 'code',
      id: 'code', // It's required for default sorting
      displayType: 'link',
      onLinkClick: (quote: Quote) => goToQuoteDetails(quote.code),
      defaultSort: 'desc'
    },
    {
      header: t('common.sales_year.label'),
      accessor: 'salesYear',
      id: 'salesYear',
      filterable: true
    },
    {
      header: t('quotes.quote_name.label'),
      accessor: 'name',
      id: 'name',
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
      id: 'statusText',
      displayType: 'custom',
      displayTemplate: (status: string) => (status ? <Badge labelText={status} /> : ''),
      filterable: true
    },
    {
      header: t('common.actions.label'),
      accessor: (_data: Quote) => {
        const isConverted = _data.statusText?.toLowerCase() === 'converted'
        const isDraft = _data.status === 'BUYER_DRAFT'

        let actions = isConverted
          ? quoteActions.filter((item) => !['edit', 'delete'].includes(item.value))
          : quoteActions
        actions = isDraft ? actions.filter((item) => !['print'].includes(item.value)) : actions
        return <TableMenu<Quote> listItems={actions} currentRow={_data} />
      },
      disableSortBy: true,
      align: 'center'
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
        setQuotes(data)
      }
      if (error) {
        setShowError(true)
      }
      setShowLoader(false)
    }
  }, [isLoading, error, data, isFetching])

  const goToQuoteDetails = (code: string) => {
    fasteRoute(`/quotes/${code}`)
  }

  const searchFun = (quote: Quote, searchStr: string) => {
    const hits = (value: string) => value?.toLowerCase().includes(searchStr)
    const matchingQuote = (quote: Quote) =>
      hits(quote.code) ||
      hits(quote.farmer?.name) ||
      hits(quote.salesYear) ||
      hits(quote.name) ||
      hits(quote.statusText) ||
      hits(quote.netPrice?.value.toString()) ||
      hits(quote.totalPrice?.value.toString()) ||
      quote.entries?.some(matchingEntry)
    const matchingEntry = (entry: QuoteEntry) => hits(entry.product?.name) || hits(entry.quantity?.toString())
    return matchingQuote(quote)
  }

  const dataToListItem = (quote: Quote) => ({
    code: quote.code,
    trailingBlock: (
      <TypoCaption>
        {quote.nonRejectedLineItemsCount}
        {space}
        {t('common.product.label', {
          count: quote.nonRejectedLineItemsCount
        })}
      </TypoCaption>
    ),
    overlineText: quote.statusText && (
      <div className={styles['overline-text-wrapper']}>
        <Badge labelText={quote.statusText} />
      </div>
    ),
    primaryText: (
      <TypoSubtitle level={2}>
        {showFarmerNameColumn ? quote.farmer?.name : `${t('quotes.quote.label')} ${quote.code}`}
      </TypoSubtitle>
    ),
    secondaryText: (
      <>
        {showFarmerNameColumn && <TypoCaption>{`${t('quotes.quote.label')} ${quote.code}`}</TypoCaption>}
        {quote.name && quote.name !== '' && (
          <>
            {showFarmerNameColumn && <br />}
            <TypoCaption>{quote.name}</TypoCaption>
          </>
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
            verticalAlign={!quotes.length || showError ? 'middle' : 'top'}
            className={
              (!quotes.length && searchTerm.trim().length === 0) || showError ? styles['container-contingency'] : ''
            }
          >
            {showLoader || showError ? (
              showLoader ? (
                <Loading label={t('quotes.loading_quotes_message.label')} />
              ) : (
                <MessageWithAction
                  messageHeader={t('quotes.error_msg_header.label')}
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
                      setQuotes([])
                      refetch()
                    }
                  }}
                />
              )
            ) : !quotes.length && searchTerm.trim().length === 0 ? (
              <MessageWithAction
                messageHeader={t('quotes.no_quotes_message_header.label')}
                messageDescription={t('quotes.no_quotes_message.description')}
                iconProps={{
                  icon: 'info_outline',
                  variant: 'filled-secondary',
                  className: 'lmnt-theme-secondary-200-bg'
                }}
                primaryButtonProps={{
                  label: t('quotes.create_quote.label'),
                  variant: 'text',
                  onClick: handleCreateQuote
                }}
              />
            ) : (
              <>
                <MediaQuery minWidth={IS_DESKTOP}>
                  <Table<Quote>
                    title={tableTitle}
                    data={quotes}
                    className={styles.quotes_table}
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
                      <div id='quotes_expansion_panel' className={styles.quotes_expansion_panel}>
                        <QuotesTableExpandedRowTemplate
                          quote={row.original}
                          handleViewQuoteDetails={() => goToQuoteDetails((row.original as Quote).code)}
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
                  <div className={styles['quote-list-mobile']}>
                    {quotes.length > 0 ? (
                      <List<Quote>
                        items={[]} // TODO refactor List component to make items optional when data and dataToListItem is given!!
                        divider={true}
                        onAction={goToQuoteDetails}
                        data={_.orderBy(quotes, ['code'], ['asc'])}
                        filterProps={{
                          filters: [
                            { title: t('common.status.label'), accessor: 'statusText' },
                            { title: t('common.sales_year.label'), accessor: 'salesYear' }
                          ]
                        }}
                        sortProps={{
                          options: [
                            { label: t('common.quote_id_a_z.label'), columnName: 'code', sortingType: 'asc' },
                            { label: t('common.quote_id_z_a.label'), columnName: 'code', sortingType: 'desc' },
                            { label: t('quotes.farmer_name_a-z.label'), columnName: 'farmer.name', sortingType: 'asc' },
                            { label: t('quotes.farmer_name_z-a.label'), columnName: 'farmer.name', sortingType: 'desc' }
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

export default QuotesList
