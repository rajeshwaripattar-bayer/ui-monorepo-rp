import _ from 'lodash'
import {
  Contingency,
  DiscretionaryDiscountsDesktop,
  DiscretionaryDiscountsMobile,
  Loading,
  ModalTopBar,
  NonDiscretionaryDiscount,
  ProductHeader
} from '@gc/components'
import styles from './AddDiscountsModal.module.scss'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@element/react-button'
import { useTranslation } from 'react-i18next'
import type { ProductWithPrice, QuantityUpdateRequest } from '@gc/components/types'
import type {
  BayerDiscountEntriesPostPayload,
  BayerDiscountEntriesPutPayload,
  Entry,
  Product,
  RecommendedRange,
  ProductLevelRange,
  EntryBrandDiscount,
  Discount,
  Strategy,
  OrderConfig
} from '@gc/types'
import MediaQuery from 'react-responsive'
import { getCurrencyFormat, scrollTop } from '@gc/utils'
import { useGetDiscretionaryBudgetsQuery } from '../../store/slices/discountsSlice'
import { useCurrentCart, useGetRecommendedRange, useUpdateCartCache } from '../../hooks/useCurrentCart'
import { interpunct, resolutions } from '@gc/constants'
import { useLocale, usePortalConfig, useSaveEntries, useScreenRes, useSelectedAccount } from '@gc/hooks'
import {
  setDiscretionaryDiscounts,
  updateDiscretionaryDiscounts,
  resetDiscretionaryDiscounts,
  useAddDiscretionaryDiscountsMultiEntryMutation,
  useUpdateDiscretionaryDiscountsMultiEntryMutation,
  useDeleteDiscretionaryDiscountsMultiEntryMutation,
  setNetUnitPrices,
  setDraftEntry,
  useCartQueries,
  setContingency,
  setNotification,
  discardAppliedAllStage,
  updateAppliedAllCart
} from '@gc/redux-store'
import { type RootState, useAppDispatch } from '../../store'
import { useSelector } from 'react-redux'
import { getDiscretionaryDiscounts, getDraftEntry, getNetUnitPrices } from '../../store/selectors/cartSelector'
import { Divider } from '@element/react-divider'
import SelectStorageLocation from '../quote-details/SelectStorageLocation'
import { getQuoteId } from '../../store/selectors/quotesSelector'
/* eslint-disable-next-line */
export interface AddDiscountsModalProps {
  setModalProps: (props: { headerActions?: ReactNode; footerActions?: ReactNode }) => void
  openModal: (
    a: string,
    options?: {
      product?: Product
      strategies?: Strategy[]
      entry?: Entry
      programName?: string
      recommendedRange?: RecommendedRange[]
      handleQuantityUpdate?: (request: QuantityUpdateRequest) => Promise<{
        isSuccess: boolean
      } | null>
      productWithPrice?: ProductWithPrice
    }
  ) => void
  entry?: Entry
  productWithPrice?: ProductWithPrice
  getMaxQuantity?: (quantity: string | number, product: ProductWithPrice) => number | undefined
  handleQuantityUpdate?: (request: QuantityUpdateRequest) => Promise<{
    isSuccess: boolean
  } | null>
  handleStorageLocationUpdate?: (
    location: { value: string; text: string },
    product: ProductWithPrice,
    applyAllRows?: boolean
  ) => void
}

export function AddDiscountsModal({
  setModalProps,
  openModal,
  entry,
  productWithPrice,
  getMaxQuantity,
  handleQuantityUpdate
}: AddDiscountsModalProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const quoteId = useSelector(getQuoteId)
  const draftEntry = useSelector(getDraftEntry)
  const { data: cart } = useCurrentCart()
  const {
    data: recommendedRange,
    isError: isRecommendedRangeFailed,
    isLoading: recommendedRangeLoading
  } = useGetRecommendedRange()
  const [saveEntries] = useSaveEntries()
  const portalConfig = usePortalConfig()
  const orderConfig: OrderConfig = portalConfig?.gcPortalConfig?.orderConfig

  const getMatchingCartEntry = useCallback(
    (entryNumber: number) => cart?.entries.find((entry: Entry) => entry.entryNumber === entryNumber),
    [cart?.entries]
  )

  const getQtyUsingEntryNumber = useCallback(
    (entryNumber: number) => getMatchingCartEntry(entryNumber)?.quantity,
    [getMatchingCartEntry]
  )

  const getCurrentQty = useCallback(
    (entryNumber: number) => {
      if (_.isNumber(draftEntry?.quantity)) return draftEntry?.quantity
      return getQtyUsingEntryNumber(entryNumber)
    },
    [draftEntry, getQtyUsingEntryNumber]
  )

  const handleLocationSelected = (location: { value: string; text: string }) => {
    if (location.value !== entry?.storageLocation?.locationCode) {
      dispatch(setDraftEntry({ ...(draftEntry ?? {}), storageLocation: location }))
    }
  }

  const {
    data: discretionaryBudgets,
    isError: isDiscretionaryBudgetsError,
    isLoading: isDiscretionaryBudgetsLoading,
    isFetching: isDiscretionaryBudgetsFetching,
    refetch
  } = useGetDiscretionaryBudgetsQuery(
    {
      salesYear: orderConfig.salesYear,
      salesOrgId: orderConfig.salesOrgId,
      brand: portalConfig.gcPortalConfig.brandFamily,
      accountDealerSAPId: useSelectedAccount().sapAccountId,
      accountGrowerSAPId: cart?.grower || ''
    },
    {
      skip: _.isEmpty(cart)
    }
  )

  const [quantity, setQuantity] = useState<string>((getCurrentQty(entry?.entryNumber || 0) || 0).toString())
  const totalUnitPrice = entry?.totalPricePerUnit?.value || 0
  const netUnitPrices = useSelector(getNetUnitPrices)
  const discountHasExceeded = useMemo(() => netUnitPrices.some(({ price }) => price <= 0), [netUnitPrices])
  const matchingNetUnitPrice = netUnitPrices.find(({ entryNumber }) => entryNumber === entry?.entryNumber)
  const netPrice =
    matchingNetUnitPrice && _.isNumber(matchingNetUnitPrice?.price) ? matchingNetUnitPrice.price : totalUnitPrice
  const discountApplied = netPrice !== totalUnitPrice
  const discretionaryDiscounts = useSelector(getDiscretionaryDiscounts)
  const [addDiscounts] = useAddDiscretionaryDiscountsMultiEntryMutation()
  const [updateDiscounts] = useUpdateDiscretionaryDiscountsMultiEntryMutation()
  const [deleteDiscounts] = useDeleteDiscretionaryDiscountsMultiEntryMutation()
  const { useDeleteCartEntryMutation } = useCartQueries()
  const [deleteEntry, { retry: retryDeleteEntry, cancel: cancelDeleteEntry }] = useDeleteCartEntryMutation()

  const [updateCartCache] = useUpdateCartCache()
  const locale = useLocale()
  const [singleDiscountModalOpen, setSingleDiscountModalOpen] = useState(false)
  const [applyingChanges, setApplyingChanges] = useState(false)
  const res = useScreenRes()
  useEffect(() => {
    return () => {
      dispatch(setContingency())
      if (res > resolutions.M1023 || !singleDiscountModalOpen) {
        // For mobile we should not reset Discretionary Discounts in store when single strategy is opened!!
        dispatch(resetDiscretionaryDiscounts())
        dispatch(setNetUnitPrices([]))
      }
    }
  }, [singleDiscountModalOpen, dispatch, res])

  useEffect(() => {
    if (discretionaryDiscounts.length === 0 && discretionaryBudgets?.length) {
      dispatch(setDiscretionaryDiscounts(cart, discretionaryBudgets, entry, quoteId))
    }
  }, [cart, discretionaryBudgets, discretionaryDiscounts.length, dispatch, entry, quoteId])

  useEffect(() => {
    if (discountHasExceeded) {
      dispatch(
        setContingency({
          code: 'DISCOUNT_EXCEEDED',
          displayType: 'alert',
          alertProps: {
            type: 'error',
            title: t('common.discount_exceeded.label'),
            description: t('common.discount_exceeded.description'),
            variant: 'tonal'
          }
        })
      )
    } else {
      dispatch(setContingency())
      setApplyingChanges(false)
    }
  }, [discountHasExceeded, dispatch, t])

  const applyButtonLabel = useMemo(
    () => (
      <>
        {`${t('common.apply.label')}${interpunct}${getCurrencyFormat(
          'USD',
          discountApplied ? netPrice : totalUnitPrice,
          locale
        )}`}
        {discountApplied && (
          <>
            &nbsp;
            <s>{getCurrencyFormat('USD', totalUnitPrice, locale)}</s>
          </>
        )}
      </>
    ),
    [t, discountApplied, netPrice, totalUnitPrice, locale]
  )

  const resetDraftDiscretionaryDiscounts = useCallback(
    () =>
      updateCartCache((draft) => {
        draft.draftDiscretionaryDiscounts = undefined
        return draft
      }),
    [updateCartCache]
  )

  const closeModal = useCallback(() => {
    dispatch(setContingency())
    dispatch(setDraftEntry(undefined))
    dispatch(discardAppliedAllStage(undefined))
    resetDraftDiscretionaryDiscounts()
    openModal('EXIT')
  }, [dispatch, openModal, resetDraftDiscretionaryDiscounts])

  useEffect(() => {
    const applyDisabled =
      applyingChanges ||
      (!draftEntry &&
        (discountHasExceeded ||
          !cart?.draftDiscretionaryDiscounts ||
          (cart?.draftDiscretionaryDiscounts.length === 0 &&
            (!entry?.discretionaryDiscounts ||
              entry?.discretionaryDiscounts.every((d) => d.discount === 0 || !d.isActive)))))

    setModalProps({
      headerActions: (
        <ModalTopBar
          title={t('common.add_discount.label', { count: 2 })}
          exitIconButtonProps={{
            icon: 'close',
            onClick: closeModal
          }}
        />
      ),
      footerActions: (
        <div>
          <MediaQuery maxWidth={1023}>
            <Button
              variant='outlined'
              themeColor='danger'
              className={styles.footer_remove_button}
              label={t('common.remove_product.label')}
              disabled={applyingChanges}
              onClick={async () => {
                setApplyingChanges(true)
                if (entry && _.isNumber(entry.entryNumber)) {
                  const res = await deleteEntry(
                    {
                      cartId: cart?.code ?? '',
                      entryNumber: entry.entryNumber
                    },
                    {
                      dispatch,
                      onError: scrollTop,
                      contingency: {
                        code: 'REMOVE_PRODUCT_FAILED',
                        onDismissAction: cancelDeleteEntry,
                        displayType: 'alert',
                        alertProps: {
                          type: 'error',
                          title: `${t('common.remove.label')} ${entry.product.name} ${t('common.action_failed_label')}`,
                          description: t('common.refresh_page_to_fix.description'),
                          variant: 'tonal',
                          actionButtonProps: {
                            label: t('common.try_again.label'),
                            onClick: retryDeleteEntry
                          }
                        }
                      }
                    }
                  )
                  if (res?.isSuccess) {
                    dispatch(
                      setNotification({
                        open: true,
                        message: `${t('common.product_removed.label')}`
                      })
                    )
                    closeModal()
                  }
                }
              }}
            />
          </MediaQuery>
          <Button
            disabled={applyDisabled}
            className={styles.footer_button}
            onClick={async () => {
              setApplyingChanges(true)
              const matchingCartEntry = getMatchingCartEntry(entry?.entryNumber || -1)
              if (draftEntry && matchingCartEntry) {
                const res = await saveEntries(
                  {
                    cartId: cart?.code ?? '',
                    data: {
                      orderEntries: [
                        {
                          product: matchingCartEntry.product,
                          entryNumber: matchingCartEntry.entryNumber,
                          quantity: parseInt(quantity),
                          ...(draftEntry?.storageLocation
                            ? { storageLocationCode: draftEntry?.storageLocation.value }
                            : {})
                        }
                      ]
                    }
                  },
                  { contingencyType: 'alert' }
                )
                if (!res?.isSuccess) {
                  // TODO - If Entry update fails we do not attempt to update discretionary discounts
                  return
                }
              }
              dispatch(setDraftEntry(undefined))

              const draftDiscretionaryDiscounts = cart?.draftDiscretionaryDiscounts || []
              const { creates, updates, deletes } = draftDiscretionaryDiscounts.reduce(
                (
                  acc: {
                    creates: BayerDiscountEntriesPostPayload[]
                    updates: BayerDiscountEntriesPutPayload[]
                    deletes: { entryNumber: string; discounts: { itemNumber: string }[] }[]
                  },
                  item
                ) => {
                  const { creates, updates, deletes } = acc
                  if (item.itemNumber && item.discount !== 0) {
                    const matching = updates.find((u) => u.entryNumber === item.entryNumber.toString())
                    if (matching) {
                      matching.discounts.push(_.omit({ ...item, itemNumber: item.itemNumber }, 'isActive'))
                    } else {
                      updates.push({
                        entryNumber: item.entryNumber.toString(),
                        discounts: [_.omit({ ...item, itemNumber: item.itemNumber }, 'isActive')]
                      })
                    }
                  } else if (item.itemNumber && item.discount === 0) {
                    const matching = deletes.find((u) => u.entryNumber === item.entryNumber.toString())
                    if (matching) {
                      matching.discounts.push({ itemNumber: item.itemNumber })
                    } else {
                      deletes.push({
                        entryNumber: item.entryNumber.toString(),
                        discounts: [{ itemNumber: item.itemNumber }]
                      })
                    }
                  } else {
                    const matching = creates.find((u) => u.entryNumber === item.entryNumber.toString())
                    if (matching) {
                      matching.discounts.push(_.omit(item, ['entryNumber', 'isActive']))
                    } else {
                      creates.push({
                        entryNumber: item.entryNumber.toString(),
                        discounts: [_.omit(item, ['entryNumber', 'isActive'])]
                      })
                    }
                  }
                  return acc
                },
                { creates: [], updates: [], deletes: [] }
              )

              const updateAllDiscounts = async (discountUpdates: (() => Promise<void>)[]) => {
                const failedRequests: (() => Promise<void>)[] = []
                const promises = discountUpdates.map((p) => p().catch(() => failedRequests.push(p)))
                await Promise.all(promises)
                if (!failedRequests.length) {
                  dispatch(updateAppliedAllCart())
                  closeModal()
                  return
                }
                scrollTop()
                dispatch(
                  setContingency({
                    code: 'UPDATE_DISCRETIONARY_DISCOUNTS_FAILED',
                    displayType: 'alert',
                    alertProps: {
                      type: 'error',
                      title: t('common.update_discretionary_discounts_failed.label'),
                      description: t('common.refresh_page_to_fix.description'),
                      variant: 'tonal',
                      actionButtonProps: {
                        label: t('common.try_again.label'),
                        onClick: () => updateAllDiscounts(failedRequests)
                      }
                    }
                  })
                )
              }

              const promises: (() => Promise<void>)[] = []
              if (creates.length) {
                promises.push(() =>
                  addDiscounts({
                    cartId: cart?.code ?? '',
                    bayerDiscountEntries: creates
                  }).unwrap()
                )
              }
              if (updates.length) {
                promises.push(() =>
                  updateDiscounts({
                    cartId: cart?.code ?? '',
                    bayerDiscountEntries: updates
                  }).unwrap()
                )
              }
              if (deletes.length) {
                promises.push(() =>
                  deleteDiscounts({
                    cartId: cart?.code ?? '',
                    bayerDiscountEntries: deletes
                  }).unwrap()
                )
              }
              await updateAllDiscounts(promises)
            }}
          >
            {applyButtonLabel}
          </Button>
        </div>
      )
    })
  }, [
    t,
    setModalProps,
    openModal,
    netPrice,
    locale,
    totalUnitPrice,
    cart?.draftDiscretionaryDiscounts,
    cart?.code,
    addDiscounts,
    updateDiscounts,
    deleteDiscounts,
    entry?.entryNumber,
    dispatch,
    updateCartCache,
    handleQuantityUpdate,
    productWithPrice,
    applyButtonLabel,
    applyingChanges,
    resetDraftDiscretionaryDiscounts,
    entry?.discretionaryDiscounts,
    entry?.quantity,
    quantity,
    discountHasExceeded,
    entry,
    deleteEntry,
    cancelDeleteEntry,
    retryDeleteEntry,
    getQtyUsingEntryNumber,
    closeModal,
    getMatchingCartEntry,
    saveEntries,
    draftEntry
  ])

  const handleDiscountItemClick = (programName: string, strategy: Strategy) => {
    setSingleDiscountModalOpen(true)
    const strategies: Strategy[] = []
    strategies.push(strategy)
    // Wrapped open modal in set timeout for updated state reflect in cleanup function!!
    setTimeout(
      () =>
        openModal('ADD_DISCOUNT_QTY', {
          strategies,
          entry,
          programName,
          recommendedRange,
          handleQuantityUpdate,
          productWithPrice
        }),
      0
    )
  }

  const updateQuantityClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    let val: string | number = event.target.value

    // Grab maxQuantity if restriction exist
    if (getMaxQuantity && productWithPrice) {
      const maxValue = getMaxQuantity(val, productWithPrice)
      if (maxValue !== undefined) {
        val = maxValue.toString()
      }
    }

    // Only update if the values are different
    if (val !== quantity) {
      setQuantity(val)
      dispatch(setDraftEntry({ ...(draftEntry ?? {}), quantity: val }))
    }
  }

  const brandDiscountData: Discount = {
    programName: 'Brand Discounts',
    strategies:
      entry?.brandDiscounts
        ?.filter((ebc: EntryBrandDiscount) => ebc.isActive)
        .map((entrybrandDisc: EntryBrandDiscount) => {
          return {
            name: `${entrybrandDisc.discountProgram.programName} ${
              entrybrandDisc.discountProgram.programTier?.paymentTypeCode
                ? `(${entrybrandDisc.discountProgram.programTier?.paymentTypeCode} - ${entrybrandDisc.discount || 0}%)`
                : ''
            }`,
            discountValue: entrybrandDisc.discountPerUnit.value,
            discountPercentage: entrybrandDisc.discount || 0,
            discountUnit: entrybrandDisc.discountType || '',
            displayDiscount: entrybrandDisc.discount || 0,
            strategyId: entrybrandDisc.discountProgram.programId
          }
        }) || []
  }

  brandDiscountData.strategies = brandDiscountData.strategies
    .slice()
    .sort((prev: Strategy, next: Strategy) => (prev.strategyId || '').localeCompare(next.strategyId || ''))

  const getCropLevelRecommendedRange = (entry: Entry | undefined) => {
    if (recommendedRangeLoading) return // This will show loader
    if (!entry || isRecommendedRangeFailed) return ''
    if (recommendedRange && recommendedRange.length > 0) {
      const cropLevelData = recommendedRange?.filter(
        (row: RecommendedRange) => row.cropName === entry.cropName?.toLowerCase()
      )
      return cropLevelData.length > 0 ? cropLevelData[0].cropLevelRange : ''
    }
    return ''
  }

  const productRecDiscount = useCallback(
    (entry: Entry) => {
      if (isRecommendedRangeFailed) return null
      if (recommendedRange && recommendedRange.length > 0) {
        const cropLevelData = recommendedRange?.filter(
          (row: RecommendedRange) => row.cropName === entry.cropName?.toLowerCase()
        )
        if (cropLevelData.length > 0) {
          return (
            cropLevelData[0].productLevelRange.filter(
              (row: ProductLevelRange) => row.Product === entry.product.acronymID
            )[0] || null
          )
        }
        return null
      }
    },
    [isRecommendedRangeFailed, recommendedRange]
  )

  if (!discretionaryDiscounts.length) {
    return (
      <>
        {(isDiscretionaryBudgetsLoading || isDiscretionaryBudgetsFetching) && (
          <Loading className={styles.loading} label={t('common.loading_discounts.label')} />
        )}
        {isDiscretionaryBudgetsError && (
          <Contingency
            className={styles.contingency}
            codes={['DISCRETIONARY_BUDGETS_ERROR']}
            types={['messageWithAction']}
            contingency={{
              code: 'DISCRETIONARY_BUDGETS_ERROR',
              displayType: 'messageWithAction',
              messageWithActionProps: {
                messageHeader: t('common.data_load_failed.label'),
                messageDescription: t('common.refresh_page_to_fix.description'),
                primaryButtonProps: { variant: 'text', label: t('common.try_again.label'), onClick: refetch },
                iconProps: {
                  icon: 'error',
                  variant: 'filled-danger',
                  className: 'lmnt-theme-danger-200-bg',
                  style: { color: '#B3190D' }
                }
              }
            }}
          />
        )}
      </>
    )
  }

  return (
    <div className={styles.container}>
      <Contingency<RootState>
        codes={[
          'REMOVE_PRODUCT_FAILED',
          'UPDATE_DISCRETIONARY_DISCOUNTS_FAILED',
          'UPDATE_ENTRY_FAILED',
          'DISCOUNT_EXCEEDED'
        ]}
        types={['alert']}
        className={styles.alert_message}
      />
      {entry && (
        <div>
          <ProductHeader
            entry={entry}
            unitOfMeasure={entry.product?.salesUnitOfMeasure || ''}
            recommendedRange={getCropLevelRecommendedRange(entry)}
            quantity={quantity}
            updateQuantity={updateQuantityClick}
          />
          {res <= resolutions.M719 && <Divider />}
        </div>
      )}
      <MediaQuery maxWidth={1023}>
        <SelectStorageLocation
          location={draftEntry?.storageLocation ?? productWithPrice?.warehouse}
          handleStorageLocationUpdate={handleLocationSelected}
        />
      </MediaQuery>

      <MediaQuery maxWidth={1023}>
        <DiscretionaryDiscountsMobile
          discountData={discretionaryDiscounts}
          onDiscountItemClick={handleDiscountItemClick}
        />
      </MediaQuery>
      {brandDiscountData.strategies.length > 0 && (
        <div className={styles.non_discretionary_discount_section}>
          <NonDiscretionaryDiscount discountData={brandDiscountData} />
        </div>
      )}
      <MediaQuery minWidth={1023}>
        {entry && (
          <div className={styles.discretionary_discount_section_desktop}>
            <DiscretionaryDiscountsDesktop
              discretionaryDiscounts={discretionaryDiscounts}
              productRecDiscount={productRecDiscount(entry)}
              onChange={(programName: string, updatedStrategy: Strategy) =>
                dispatch(
                  updateDiscretionaryDiscounts(cart, discretionaryBudgets, entry, programName, updatedStrategy, quoteId)
                )
              }
              cropName={entry?.cropName || ''}
            />
          </div>
        )}
      </MediaQuery>
    </div>
  )
}

export default AddDiscountsModal
