import styles from './Quotes.module.scss'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import QuoteModalContainer from '../quote-create/QuoteModalContainer'
import { RootState, useAppDispatch } from '../../store'
import { setInEditMode } from '../../store/slices/quotesSlice'
import { getFasteStoreKey } from '@gc/utils'
import MediaQuery from 'react-responsive'
import { IS_MOBILE, IS_DESKTOP } from '@gc/constants'
import { Icon } from '@element/react-icon'
import { FloatingButton } from '@gc/components'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { QuotesList, TopBar, Header, SearchBarMobile } from '@gc/components'
import _ from 'lodash'
import { useAppSessionData, useCurrentCart } from '@gc/hooks'
import { clearBrandDiscount, setContingency } from '@gc/redux-store'
import { useSelector } from 'react-redux'

export type QuotesProps = object

export function Quotes(_props: QuotesProps) {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const appSessionData = useAppSessionData()
  const { state } = window.history
  const farmer = state?.farmer
  const contingency = useSelector((state: RootState) => state.app.contingency)
  const [openQuoteCreate, setOpenQuoteCreate] = useState(!!farmer)
  const [openSearch, setOpenSearch] = useState(false)
  const fasteStoreKey = getFasteStoreKey('quotes', 'quotes')
  const [searchTerm, setSearchTerm] = useState(_.get(appSessionData, `${fasteStoreKey}.searchTerm`, '') as string)
  const { isError: cartError, refetch: refetchCart } = useCurrentCart({ skip: !openQuoteCreate })

  const handleCreateQuote = () => {
    dispatch(setInEditMode(false))
    dispatch(clearBrandDiscount())
    setOpenQuoteCreate(true)
  }

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
  const handleCancelSearch = (_e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm('')
  }

  useEffect(() => {
    if (cartError && (!contingency || contingency.code !== 'QUOTE_CREATE_FAILED')) {
      setOpenQuoteCreate(false)
      dispatch(
        setContingency({
          code: 'QUOTE_CREATE_FAILED',
          displayType: 'dialog',
          dialogProps: {
            title: t('quotes.create_start_failed.label'),
            message: t('common.refresh_page_to_fix.description'),
            open: true,
            actionButtonProps: {
              label: t('common.try_again.label'),
              onAction: () => setOpenQuoteCreate(true)
            }
          }
        })
      )
    }
  }, [cartError, contingency, dispatch, refetchCart, t])

  return (
    <div className={styles.container}>
      <MediaQuery minWidth={IS_DESKTOP}>
        <div className={styles.header}>
          <Header
            title={t('quotes.label')}
            buttonProps={
              [{ label: t('quotes.create_quote.label'), onClick: handleCreateQuote, variant: 'filled' }]
              // !isLoading ? [{ label: t('quotes.create_quote.label'), onClick: handleCreateQuote, variant: 'filled' }] : []
            }
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
            title={t('quotes.label')}
            trailingBlock={<Icon icon='search' style={{ marginTop: '4px' }} onClick={handleOpenSearch} />}
          />
        )}
        {!openQuoteCreate && (
          <FloatingButton
            leadingIcon={<Icon icon='add' />}
            variant='filled'
            label={t('quotes.quote.label')}
            buttonSize='xlarge'
            onClick={handleCreateQuote}
          />
        )}
      </MediaQuery>
      <QuotesList
        tableTitle={t('quotes.your_quotes.label')}
        searchTerm={searchTerm}
        fasteStoreKey={fasteStoreKey}
        showFarmerNameColumn
        dispatch={dispatch}
        handleCreateQuote={handleCreateQuote}
      />
      {openQuoteCreate && (
        <QuoteModalContainer
          open={openQuoteCreate}
          setOpen={setOpenQuoteCreate}
          modalName={farmer ? 'CREATE_QUOTE' : 'SELECT_FARMER'}
        />
      )}
    </div>
  )
}

export default Quotes
