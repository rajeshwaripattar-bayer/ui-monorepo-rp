import { Grid, GridCol, GridRow } from '@element/react-grid'
import { Group } from '@element/react-group'
import { Icon } from '@element/react-icon'
import { IconButton } from '@element/react-icon-button'
import { TypoDisplay } from '@element/react-typography'
import {
  BillingSection,
  ConfirmationModal,
  Contingency,
  CropSummary,
  Loading,
  MessageWithAction,
  ProductsSection
} from '@gc/components'
import { IS_DESKTOP, IS_MOBILE, resolutions } from '@gc/constants'
import type { BillToParty, Cart, DomainDefGcPortalConfig, Entry, OrderConfig, Product, Quote } from '@gc/types'
import _ from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MediaQuery from 'react-responsive'
import styles from './QuoteDetails.module.scss'

import { Textfield } from '@element/react-textfield'
import { ActionMenuButton, Header, TopBar } from '@gc/components'
import type { ProductWithPrice, QuantityUpdateRequest } from '@gc/components/types'
import { useLocale, useResetState, useScreenRes, useSelectedAccount } from '@gc/hooks'
import { useParams } from 'react-router-dom'
import { setInEditMode, setInReviewMode, setQuoteId, setRedirectToFarmers } from '../../store/slices/quotesSlice'

import { Button, type ButtonProps } from '@element/react-button'
import { Select } from '@element/react-select'
import { Snackbar } from '@element/react-snackbar'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import { Alert } from '@gc/components'
import { usePortalConfig, useQuoteActions } from '@gc/hooks'
import {
  setCartId,
  setContingency,
  updateAppliedAllQuotes,
  useDeleteCartMutation,
  useQuotesQueries,
  useUpdateCartAttributesMutation
} from '@gc/redux-store'
import type { ExpirationDateOption, QuoteActionType, RecommendedRange } from '@gc/types'
import { calculateOffsetDate, fasteRoute, formatDateWithTimezoneOffset, getDateFromUTC, scrollTop } from '@gc/utils'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  useCurrentCart,
  useGetRecommendedRange,
  useSaveEntries,
  useSaveQuote,
  useUpdateCartCache
} from '../../hooks/useCurrentCart'
import { type RootState, useAppDispatch } from '../../store'
import { getCartId, getSaveInProgressEntries } from '../../store/selectors/cartSelector'
import { getInEditMode, getInReviewMode, getRedirectToFarmers } from '../../store/selectors/quotesSelector'
import { useGetDiscretionaryBudgetsQuery } from '../../store/slices/discountsSlice'
import QuoteModalContainer from '../quote-create/QuoteModalContainer'

type ModalState = {
  name: string
  open: boolean
  props: {
    isAddPayer?: boolean
    product?: Product
    selectedPayer?: BillToParty
  }
}

export function QuoteDetails() {
  const dispatch = useAppDispatch()
  const portalConfig = usePortalConfig()
  const cropList: DomainDefGcPortalConfig['cropList'] = portalConfig?.gcPortalConfig?.cropList
  const orderConfig: OrderConfig = portalConfig?.gcPortalConfig?.orderConfig
  const quotesApi = useQuotesQueries()
  const { useGetQuoteDetailsQuery, useUpdateQuoteMutation } = quotesApi
  const { t } = useTranslation()
  const { state } = window.history
  const { code } = useParams()
  const res = useScreenRes()
  const sapAccountId = useSelectedAccount().sapAccountId
  const isMobile = res <= resolutions.M1023
  const { data, error, isLoading, refetch } = useGetQuoteDetailsQuery({
    quoteId: code as string,
    isMobile
  })
  const saveInProgressEntries = useSelector(getSaveInProgressEntries)
  const inEditMode = useSelector(getInEditMode)
  const redirectToFarmers = useSelector(getRedirectToFarmers)
  const inReviewMode = useSelector(getInReviewMode)
  const cartId = useSelector(getCartId)
  const [saveDisabled, setSaveDisabled] = useState(!inReviewMode && state?.modal?.name !== 'ABANDON_QUOTE')
  const [originalExpirationDate, setOriginalExpirationDate] = useState('')

  useEffect(() => {
    dispatch(setQuoteId(code))
  }, [code, dispatch])

  useEffect(() => {
    if (!_.isUndefined(state?.inEditMode)) {
      dispatch(setInEditMode(state.inEditMode))
    }
    if (!_.isUndefined(state?.inReviewMode)) {
      dispatch(setInReviewMode(state.inReviewMode))
      // If cartId is not present in state for inReviewMode then put selected quote in edit mode.
      if (_.isUndefined(state?.cartId) && state.quoteCode) {
        handleClickEdit(state.quoteCode)
      }
    }
    if (!_.isUndefined(state?.cartId)) {
      dispatch(setCartId(state.cartId))
    }
    if (!_.isUndefined(state?.modal)) {
      openEditQuoteModal(state?.modal.name, state?.modal.data)
    }
    window.history.replaceState(
      { inEditMode: undefined, inReviewMode: undefined, cartId: undefined, modal: undefined, quoteCode: undefined },
      ''
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.inEditMode, state?.inReviewMode, state?.cartId])

  const [savingQuote, setSavingQuote] = useState(false)

  const [, { isLoading: savingEntries, isError: isErrorSavingEntries }] = useSaveEntries()
  const [saveClicked, setSaveClicked] = useState(false)
  const [saveQuote] = useSaveQuote()
  const [initEditQuote, { isLoading: editQuoteLoading, retry: retryInitEdit, cancel: cancelInitEdit }] =
    useUpdateQuoteMutation()

  const { data: cart } = useCurrentCart({
    skip: !cartId || editQuoteLoading || !inEditMode
  })
  useGetRecommendedRange(true)

  const cartRef = useRef<Cart>()
  cartRef.current = cart
  const [deleteCart] = useDeleteCartMutation()

  useGetDiscretionaryBudgetsQuery(
    {
      salesYear: orderConfig.salesYear,
      salesOrgId: orderConfig.salesOrgId,
      brand: portalConfig.gcPortalConfig.brandFamily,
      accountDealerSAPId: sapAccountId,
      accountGrowerSAPId: cart?.grower ?? ''
    },
    { skip: _.isEmpty(cart) }
  )
  const [cartSnapShot, setCartSnapShot] = useState<Cart | null>(null)
  const [quoteModal, setQuoteModal, resetModalState] = useResetState<ModalState>({ open: false, name: '', props: {} })

  const [updateCartCache] = useUpdateCartCache()
  const [updateCartAttributes, { isLoading: updatingCart }] = useUpdateCartAttributesMutation()

  const [showLoader, setShowLoader] = useState(true)
  const [openConfirmationSnackBar, setOpenConfirmationSnackBar] = useState(false)
  const emptyConformationModal = {
    open: false,
    title: '',
    primaryButtonProps: { text: '' },
    dismissiveButtonProps: { text: '' },
    message: '',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onConfirmation: () => {}
  }
  const [modalState, setModalState] = useState(emptyConformationModal)

  const isDraft = data?.status === 'BUYER_DRAFT'
  const quoteActions = useMemo(() => {
    const actions = portalConfig?.quotesModule?.quoteActions
    return isDraft ? actions.filter((item) => !['print'].includes(item)) : actions
  }, [isDraft, portalConfig?.quotesModule?.quoteActions])

  const allowedUserActions: QuoteActionType[] = quoteActions.filter((type) => {
    switch (type) {
      case 'convertToOrder':
        return isMobile && data?.statusText?.toLowerCase() !== 'converted'
      case 'edit':
        return isMobile
      case 'delete':
        return data?.statusText?.toLowerCase() !== 'converted'
      default:
        return true
    }
  })

  const listItemsDesktop = useQuoteActions(allowedUserActions, setModalState, dispatch)

  const [name, setName] = useState<string | null>(null)
  const locale = useLocale()
  const [expirationDate, setExpirationDate] = useState('')
  const navigate = useNavigate()
  const [disableEditButton, setDisableEditButton] = useState<boolean>(false)

  const dataSource = useMemo(() => (inEditMode ? cart : data), [cart, data, inEditMode])
  const entriesFound = useMemo(() => dataSource?.entries?.some((e) => !e.rejected), [dataSource])
  const hasExclusions = useMemo(
    () => dataSource?.entries.some((entry: Entry) => !entry.rejected && entry.product.canOrder === false),
    [dataSource?.entries]
  )

  const cropsNameList = useMemo(() => cropList.map((item) => item.cropName), [cropList])

  // This effect is monitoring changes to cart by using cartSnapShot to update Save button disabled state!
  useEffect(() => {
    if (cart && cart?.code === cartId) {
      if (name === null) {
        setName(cart?.name)
      }
      if (!inReviewMode) {
        if (!cartSnapShot && !savingQuote) {
          setCartSnapShot(_.cloneDeep(cart))
        } else {
          const cartModified = !_.isEqual(_.omit(cart, ['draftEntries', 'draftDiscretionaryDiscounts']), cartSnapShot)
          const nameModified = name !== (cart?.name || '')
          if (cartSnapShot && (cartModified || nameModified || originalExpirationDate !== expirationDate)) {
            setSaveDisabled(false)
          }
        }
      }
    }
  }, [
    cart,
    cartId,
    cartSnapShot,
    inReviewMode,
    name,
    savingQuote,
    expirationDate,
    locale,
    data?.expirationTime,
    originalExpirationDate
  ])

  const cleanUp = () => {
    if (inEditMode) {
      if (saveDisabled) {
        dispatch(setContingency())
        dispatch(setCartId(undefined))
        deleteCart(cart?.code ?? '').unwrap()
        dispatch(setInEditMode(false))
        dispatch(setInReviewMode(false))
        if (inReviewMode) {
          dispatch(quotesApi.util.invalidateTags(['Quote']))
        }
      } else {
        fasteRoute(`/quotes/${code}`, { inEditMode, cartId, modal: { name: 'ABANDON_QUOTE', data: { quoteId: code } } })
      }
    }
  }
  const cleanUpRef = useRef<() => void>(cleanUp)
  cleanUpRef.current = cleanUp
  useEffect(() => {
    scrollTop()
    if (inReviewMode) {
      handleClickEdit()
    }
    return () => {
      // In case user navigates away from Edit quote this cleanup will discard cart
      if (!window.location.pathname.endsWith(`/${code}`)) {
        cleanUpRef.current()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setFormattedExpirationDate = useCallback(
    (expDate: Date) => {
      setExpirationDate(getDateFromUTC(expDate, locale))
    },
    [locale]
  )

  useEffect(() => {
    if (!isLoading && showLoader) setShowLoader(false)
  }, [isLoading, showLoader])

  useEffect(() => {
    if (!inEditMode) {
      setDisableEditButton(false)
      setCartSnapShot(null)
    }
    if (saveDisabled) {
      setSaveDisabled(!inReviewMode)
    }
  }, [inEditMode, data?.expirationTime, cart?.expirationTime, setFormattedExpirationDate, inReviewMode, saveDisabled])

  useEffect(() => {
    setName((_.isString(cart?.name) ? cart?.name : data?.name) ?? '')
    if (inEditMode && cart?.expirationTime) {
      setFormattedExpirationDate(new Date(cart?.expirationTime))
    } else if (data?.expirationTime) {
      setFormattedExpirationDate(new Date(data?.expirationTime))
    }
    if (data?.expirationTime) {
      setOriginalExpirationDate(getDateFromUTC(new Date(data?.expirationTime), locale))
    }
  }, [cart?.name, data, setFormattedExpirationDate, cart?.expirationTime, locale, expirationDate, inEditMode])

  useEffect(() => {
    if (isLoading || savingQuote) return

    updateCartCache((draft) => {
      draft.grower = data?.primaryPayer ?? ''
      return draft
    })
  }, [
    cart?.billToParties,
    cropsNameList,
    data?.billToParties,
    data?.primaryPayer,
    dataSource?.cropLevelDetails,
    dataSource?.entries,
    inEditMode,
    isLoading,
    locale,
    saveInProgressEntries,
    savingQuote,
    updateCartCache
  ])

  useEffect(() => {
    if (saveClicked && !saveInProgressEntries.length && !updatingCart) {
      setSaveClicked(false)
      dispatch(setContingency())
      setSavingQuote(true)
      setCartSnapShot(null)
      setSaveDisabled(true)
      dispatch(updateAppliedAllQuotes())
      saveQuote(code, redirectToFarmers)
        .then(() => {
          if (redirectToFarmers) {
            const primaryParty = cart?.billToParties.filter((p) => p.isPrimaryBillTo)
            if (primaryParty) {
              dispatch(setRedirectToFarmers(false))
              fasteRoute(`/farmers/${primaryParty[0].sapAccountId}`)
            }
          }
        })
        .catch(() => setSaveDisabled(false))
        .finally(() => setSavingQuote(false))
    }
  }, [
    cart?.billToParties,
    code,
    dispatch,
    isErrorSavingEntries,
    redirectToFarmers,
    saveClicked,
    saveInProgressEntries.length,
    saveQuote,
    savingEntries,
    updatingCart
  ])

  const mobileButtonProps: ButtonProps[] = [
    {
      label: t('quotes.edit_name_and_expiration.label'),
      onClick: () => {
        handleClickEditQuoteDetails()
      },
      variant: 'outlined'
    }
  ]

  const desktopButtonProps: ButtonProps[] = [
    data?.statusText?.toLowerCase() !== 'converted' && {
      label: t('common.edit.label'),
      onClick: () => handleClickEdit(),
      variant: 'outlined',
      disabled: disableEditButton || inEditMode
    }
  ].filter(Boolean) as ButtonProps[]

  if (quoteActions.includes('convertToOrder')) {
    desktopButtonProps.push({
      label: t('quotes.convert_to_order.label'),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClick: () => {},
      variant: 'filled'
    })
  }

  const openEditQuoteModal = (
    modalName: string,
    modalProps?: {
      quoteId?: string
      name?: string
      expirationDate?: string
      originalExpirationDate?: string
      originalName?: string
      isAddPayer?: boolean
      selectedPayer?: BillToParty
      product?: Product
      entry?: Entry
      showNonDiscretionaryDiscount?: boolean
      productWithPrice?: ProductWithPrice
      recommendedRange?: RecommendedRange[]
      getMaxQuantity?: (quantity: string | number, product: ProductWithPrice) => number | undefined
      handleQuantityUpdate?: (request: QuantityUpdateRequest) => void
      handleStorageLocationUpdate?: (
        location: { value: string; text: string },
        product: ProductWithPrice,
        applyAllRows?: boolean
      ) => void
    }
  ) => {
    setQuoteModal({ open: true, name: modalName, props: modalProps || {} })
  }

  const getExpirationDateOption = () => {
    const expirationDatesConfig = expirationDateOptions.map((expDate: ExpirationDateOption) => ({
      ...expDate,
      selectText: (
        <>
          <TypoSubtitle bold level={2}>
            {t(expDate.description)}
          </TypoSubtitle>
          <br />
          <TypoCaption>{getDateFromUTC(calculateOffsetDate(expDate.timePeriod, expDate.duration), locale)}</TypoCaption>
        </>
      ),
      expirationDate: calculateOffsetDate(expDate.timePeriod, expDate.duration)
    }))
    if (expirationDate && !inReviewMode) {
      return [
        {
          code: 'currentExpirationDate',
          expirationDate: new Date(expirationDate),
          selectText: (
            <>
              <TypoSubtitle bold level={2}>
                {t('quotes.expiration_current_expiration_date.label')}
              </TypoSubtitle>
              <br />
              <TypoCaption>{originalExpirationDate}</TypoCaption>
            </>
          )
        },
        ...expirationDatesConfig
      ]
    }
    return expirationDatesConfig
  }

  const expirationDateOptions: ExpirationDateOption[] = portalConfig?.gcPortalConfig?.expirationDateOptions
  const expirationDatesConfig: ExpirationDateOption[] = expirationDateOptions.map((expDate: ExpirationDateOption) => ({
    ...expDate,
    selectText: (
      <>
        <TypoSubtitle bold level={2}>
          {t(expDate.description)}
        </TypoSubtitle>
        <br />
        <TypoCaption>{getDateFromUTC(calculateOffsetDate(expDate.timePeriod, expDate.duration), locale)}</TypoCaption>
      </>
    ),
    expirationDate: calculateOffsetDate(expDate.timePeriod, expDate.duration)
  }))

  const updateQuoteName = (name: string) => {
    if (cart && cart.name !== name) {
      try {
        updateCartAttributes({
          cartId: cart.code,
          attributes: {
            name: name,
            grower: cart.grower,
            agentSapId: sapAccountId
          }
        }).unwrap()
      } catch (error) {
        console.log('An error occurred updating cart attributes', error)
      }
    }
  }

  const clearQuote = () => {
    setName('')
    updateQuoteName('')
  }

  const EditableFields = () => (
    <div className={styles.wrapper}>
      <TypoSubtitle level={2} className={styles.label}>
        {t('quotes.quote_name.label')}:
      </TypoSubtitle>
      <Textfield
        style={{ height: '40px', alignContent: 'center' }}
        className={styles.quote_input}
        variant='outlined'
        value={name ?? ''}
        dense
        counter
        maxlength={35}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
        onBlur={(event: React.ChangeEvent<HTMLInputElement>) => updateQuoteName(event.target.value)}
        trailingIcon={name ? <IconButton onClick={clearQuote} icon='close' /> : null}
      />
      <TypoSubtitle level={2} className={styles.label}>
        {t('quotes.expiration_date.label')}:
      </TypoSubtitle>
      <Select
        className={styles.quote_input}
        variant='outlined'
        value={expirationDate}
        options={getExpirationDateOption()}
        valueKey='code'
        textKey='selectText'
        style={{ width: '300px', height: '40px', alignContent: 'center' }}
        onChange={(event: ExpirationDateOption) => {
          if (event.code === 'currentExpirationDate') {
            setExpirationDate(originalExpirationDate)
          } else if (event.code !== 'currentExpirationDate') {
            const selectedDate: ExpirationDateOption = expirationDatesConfig.find(
              (expDate: ExpirationDateOption) => expDate.code === event.code
            ) as ExpirationDateOption
            setFormattedExpirationDate(selectedDate.expirationDate)
            if (cart) {
              updateCartAttributes({
                cartId: cart.code,
                attributes: {
                  name: cart?.name,
                  grower: cart.grower,
                  expirationDate: formatDateWithTimezoneOffset(selectedDate.expirationDate),
                  agentSapId: sapAccountId
                }
              }).unwrap()
            }
          }
        }}
      />
    </div>
  )

  const openAbandonQuoteModal = () => {
    openEditQuoteModal('ABANDON_QUOTE', { quoteId: code })
  }

  const handleClickBack = () => {
    dispatch(setCartId(undefined))
    setContingency()
    navigate(-1)
  }

  const handleClickEdit = async (quoteCode?: string) => {
    const res = (await initEditQuote(
      {
        quoteId: quoteCode ?? code ?? '',
        reqBody: { action: 'EDIT' }
      },
      {
        dispatch,
        contingency: {
          code: 'EDIT_QUOTE_FAILED',
          displayType: 'dialog',
          onDismissAction: cancelInitEdit,
          dialogProps: {
            title: t('quotes.edit_failed.label'),
            message: t('common.refresh_page_to_fix.description'),
            open: true,
            actionButtonProps: {
              label: t('common.try_again.label'),
              onAction: retryInitEdit
            }
          }
        }
      }
    )) as { data: Quote | undefined } | undefined
    if (res?.data) {
      setDisableEditButton(true)
      setSaveDisabled(true)
      setName(null)
      dispatch(setCartId(res.data.cartId))
      dispatch(setInEditMode(true))
    }
  }

  const handleClickEditQuoteDetails = () => {
    openEditQuoteModal('CREATE_QUOTE', {
      name: name?.toString(),
      expirationDate: expirationDate,
      originalExpirationDate: data?.expirationTime ? getDateFromUTC(new Date(data?.expirationTime), locale) : undefined,
      originalName: cart?.name ?? data?.name
    })
  }

  const setOpenFun = useCallback(
    (openModal: boolean) => {
      if (!openModal) {
        resetModalState()
      }
    },
    [resetModalState]
  )

  const saveButton = (
    <Button
      variant='filled'
      label={t('common.save.label')}
      disabled={savingQuote || !entriesFound || saveDisabled}
      onClick={() => {
        setSaveClicked(true)
        setSavingQuote(true)
      }}
    />
  )

  return (
    <>
      <MediaQuery maxWidth={IS_MOBILE}>
        {inEditMode ? (
          <TopBar
            title={inReviewMode ? t('quotes.review_quote.label') : t('quotes.edit_quote.label')}
            leadingBlock={<Icon icon='close' onClick={openAbandonQuoteModal} />}
            trailingBlock={saveButton}
          />
        ) : (
          <TopBar
            title={t('quotes.view_quote.label')}
            leadingBlock={<Icon icon='arrow_back' onClick={handleClickBack} />}
            trailingBlock={
              data?.statusText?.toLowerCase() !== 'converted' ? (
                <Button variant='outlined' label='Edit' onClick={() => handleClickEdit()} />
              ) : undefined
            }
            // moreActions={{ icon: 'more_vert', data, listItems: listItemsMobile }}
          />
        )}
      </MediaQuery>
      <Grid
        className={res <= resolutions.M719 ? `${styles.container} lmnt-theme-surface-variant-bg` : styles.container}
      >
        <Contingency<RootState> codes={['REMOVE_PRODUCT_FAILED']} types={['alert']} className={styles.alert_message} />
        {inEditMode && (
          <MediaQuery minWidth={IS_DESKTOP}>
            <GridRow className={styles.desktop_top_bar}>
              <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
                <IconButton className={styles.trailing_icon}>
                  <Icon icon='close' onClick={openAbandonQuoteModal} />
                </IconButton>
                <TypoDisplay className={styles.title} level={6}>
                  {inReviewMode ? t('quotes.review_quote.label') : t('quotes.edit_quote.label')}
                </TypoDisplay>
                <Group className={styles.actions_desktop} direction='vertical'>
                  {saveButton}
                </Group>
              </GridCol>
            </GridRow>
          </MediaQuery>
        )}
        {showLoader || error ? (
          <GridRow className={styles.container_contingency}>
            <GridCol desktopCol={12} tabletCol={8} phoneCol={4} verticalAlign='middle'>
              {showLoader ? (
                <Loading data-testid='loader' label={t('quotes.loading_quote_message.label')} />
              ) : (
                <MessageWithAction
                  messageHeader={t('quotes.could_not_load_quote.label')}
                  messageDescription={t('quotes.could_not_load_quote.description')}
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
                      refetch()
                    }
                  }}
                />
              )}
            </GridCol>
          </GridRow>
        ) : (
          <>
            <div className={`${styles.header} lmnt-theme-surface-bg`}>
              {cart && !entriesFound && (inReviewMode || inEditMode) && (
                <Alert
                  className={styles.alert_message}
                  type='error'
                  variant='tonal'
                  title={t('quotes.must_contain_product.description')}
                />
              )}
              {hasExclusions && (
                <Alert
                  type='error'
                  variant='tonal'
                  className={styles.alert_message}
                  title={t('quotes.contains_exclusions.title')}
                  description={t('quotes.contains_exclusions.description')}
                />
              )}
              <MediaQuery maxWidth={IS_MOBILE}>
                <Header
                  secText1={dataSource?.name}
                  secText2={expirationDate !== undefined ? `${t('quotes.expires.label')} ${expirationDate}` : ''}
                  overlineText={data?.statusText}
                  title={`${t('quotes.quote.label')} ${code}`}
                  buttonProps={inEditMode ? mobileButtonProps : []}
                  inEditMode={inEditMode}
                />
              </MediaQuery>
              <MediaQuery minWidth={IS_DESKTOP}>
                <Header
                  secText1={inEditMode ? cart?.name : data?.name}
                  secText2={expirationDate !== undefined ? `${t('quotes.expires.label')} ${expirationDate}` : ''}
                  overlineText={data?.statusText}
                  title={`${t('quotes.quote.label')} ${code}`}
                  buttonProps={!inEditMode ? desktopButtonProps : []}
                  moreActions={
                    !inEditMode ? { buttonLabel: t('common.more.label'), data, listItems: listItemsDesktop } : undefined
                  }
                  inEditMode={inEditMode}
                />
              </MediaQuery>
            </div>
            {inEditMode && (
              <MediaQuery minWidth={IS_DESKTOP}>
                <GridRow className={styles.section}>
                  <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
                    {EditableFields()}
                  </GridCol>
                </GridRow>
              </MediaQuery>
            )}
            <GridRow className={styles.section}>
              <GridCol desktopCol={6} tabletCol={8} phoneCol={4}>
                <BillingSection
                  inEditMode={inEditMode}
                  isLoading={isLoading}
                  editIsLoading={editQuoteLoading}
                  billToParties={inEditMode ? cart?.billToParties : data?.billToParties}
                  actions={{ openEditModal: openEditQuoteModal }}
                />
              </GridCol>
              <GridCol desktopCol={6} tabletCol={8} phoneCol={4}>
                <div className={styles['crop-summary-section']}>
                  <CropSummary
                    title={t('common.price_summary.description')}
                    summaryFor={t('quotes.quote.label')}
                    cropLevelDetails={dataSource?.cropLevelDetails || []}
                  />
                </div>
              </GridCol>
            </GridRow>
            <GridRow className={styles.section}>
              <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
                <ProductsSection data={data} inEditMode={inEditMode} openModal={openEditQuoteModal} currencyIso='USD' />
              </GridCol>
            </GridRow>
            <MediaQuery maxWidth={IS_MOBILE}>
              {!inEditMode && !quoteModal.open && (
                <ActionMenuButton
                  leadingIcon='add'
                  buttonLabel={t('common.actions.label')}
                  actionItems={listItemsDesktop}
                  data={data}
                />
              )}
            </MediaQuery>
            <ConfirmationModal
              {...modalState}
              handleClose={() => {
                setModalState(emptyConformationModal)
              }}
            />
            <Snackbar
              open={openConfirmationSnackBar}
              dismissLabel={t('common.dismiss.label')}
              timeout={4000}
              onClose={() => {
                setOpenConfirmationSnackBar(false)
              }}
            >
              <TypoSubtitle level={2}>{`${code} ${t('quotes.quote_delete_successful.label')}`}</TypoSubtitle>
            </Snackbar>
          </>
        )}
      </Grid>

      {quoteModal.open && (
        <QuoteModalContainer
          open={quoteModal.open}
          setOpen={setOpenFun}
          modalName={quoteModal?.name}
          modalProps={quoteModal?.props}
        />
      )}
    </>
  )
}

export default QuoteDetails
