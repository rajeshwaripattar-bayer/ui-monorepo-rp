import styles from './CreateQuoteModal.module.scss'
import { TypoOverline, TypoSubtitle, TypoCaption } from '@element/react-typography'
import { Textfield } from '@element/react-textfield'
import { Contingency, Loading, ModalTopBar, NonDiscretionaryDiscount, PayerList } from '@gc/components'
import { useTranslation } from 'react-i18next'
import type {
  BillToParty,
  BrandDiscountEntry,
  ExpirationDateOption,
  Farmer,
  OrderConfig,
  SapSalesArea
} from '@gc/types'
import { useMemo, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useLocale, usePortalConfig, useSelectedAccount } from '@gc/hooks'
import { List } from '@element/react-list'
import {
  clearBrandDiscount,
  setBrandDiscount,
  setPayerList,
  setSelectedProductCrop,
  useAddBrandDiscountsMutation,
  useDeleteBrandDiscountsMutation,
  useUpdateBrandDiscountsMutation,
  useUpdateCartAttributesMutation
} from '@gc/redux-store'
import { useNavigate } from 'react-router-dom'
import { setRedirectToFarmers } from '../../store/slices/quotesSlice'
import { useAppDispatch } from '../../store'
import { Button } from '@element/react-button'
import { interpunct, PREPAY } from '@gc/constants'
import { useConvertCartToQuote, useCurrentCart, useUpdateCartCache } from '../../hooks/useCurrentCart'
import { setContingency, setNotification } from '@gc/redux-store'
import { useSelector } from 'react-redux'
import { getInEditMode } from '../../store/selectors/quotesSelector'
import { calculateOffsetDate, getDateFromUTC } from '@gc/utils'
import type { Discount, Strategy } from '@gc/types'
import { useGetBrandDiscountsQuery } from '../../store/slices/discountsSlice'
import { formatDateWithTimezoneOffset } from '@gc/utils'
import { getBrandDiscount } from '../../store/selectors/cartSelector'
import _ from 'lodash'
/* eslint-disable-next-line */
export interface CreateQuoteModalProps {
  setModalProps: (props: { headerActions?: ReactNode; footerActions?: ReactNode }) => void
  openModal: (a: string, options?: { selectedPayer?: BillToParty }) => void
  showNonDiscretionaryDiscount?: boolean
  name?: string
  expirationDate?: string
  originalExpirationDate?: string
  originalName?: string
}

export function CreateQuoteModal(props: CreateQuoteModalProps) {
  const { setModalProps, openModal } = props
  const dispatch = useAppDispatch()
  const { data: cart, refetch: refetchCart } = useCurrentCart()
  const [name, setName] = useState<string | null>(props.name || null)
  const [applyingChanges, setApplyingChanges] = useState(false)
  const [updateCartAttributes] = useUpdateCartAttributesMutation()
  const [convertCartToQuote] = useConvertCartToQuote()
  const [updateCartCache] = useUpdateCartCache()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const sapAccountId = useSelectedAccount().sapAccountId
  const inEditMode = useSelector(getInEditMode)
  const savedBrandDiscount = useSelector(getBrandDiscount)

  const portalConfig = usePortalConfig() //Fetch portal config
  const expirationDateOptions: ExpirationDateOption[] = portalConfig?.gcPortalConfig?.expirationDateOptions
  const orderConfig: OrderConfig = portalConfig?.gcPortalConfig?.orderConfig
  const crops: string[] = portalConfig?.gcPortalConfig?.crops
  const defaultPrepayQualification = portalConfig?.gcPortalConfig.discounts.nonDiscretionaryDiscount.defaultPrepay
  const { state } = window.history
  const expirationDatesConfig: ExpirationDateOption[] = useMemo(
    () =>
      expirationDateOptions.map((expDate: ExpirationDateOption) => ({
        ...expDate,
        expirationDate: calculateOffsetDate(expDate.timePeriod, expDate.duration)
      })),
    [expirationDateOptions]
  )
  const [selectedExpirationDate, setSelectedExpirationDate] = useState<string>()
  const [quoteUpdating, setQuoteUpdating] = useState(false)
  const [brandDiscountData, setBrandDiscountData] = useState<Discount>()
  const [brandDiscountEntries, setBrandDiscountEntries] = useState<BrandDiscountEntry[]>()
  const {
    data: brandDiscounts,
    isError: isBrandDiscountsError,
    isLoading: isBrandDiscountsLoading,
    isFetching: isBrandDiscountsFetching,
    refetch: refetchBrandDiscounts
  } = useGetBrandDiscountsQuery()
  const [addBrandDiscount] = useAddBrandDiscountsMutation()
  const [updateBrandDiscount] = useUpdateBrandDiscountsMutation()
  const [deleteBrandDiscount] = useDeleteBrandDiscountsMutation()
  const locale = useLocale()
  const expirationDates = useMemo(() => {
    return expirationDatesConfig.map(
      (expirationDateOption: ExpirationDateOption) => {
        return {
          id: expirationDateOption.code,
          leadingBlockType: 'radio',
          primaryText: (
            <TypoSubtitle bold level={2}>
              {t(expirationDateOption.description)}
            </TypoSubtitle>
          ),
          secondaryText: <TypoCaption>{getDateFromUTC(expirationDateOption.expirationDate, locale)}</TypoCaption>
        }
      },
      [expirationDateOptions]
    )
  }, [expirationDateOptions, t, expirationDatesConfig, locale])

  const getExpirationDateOption = () => {
    if (inEditMode && props?.originalExpirationDate) {
      return [
        {
          id: 'currentExpirationDate',
          leadingBlockType: 'radio',
          primaryText: (
            <TypoSubtitle bold level={2}>
              {t('quotes.expiration_current_expiration_date.label')}
            </TypoSubtitle>
          ),
          secondaryText: <TypoCaption>{props.originalExpirationDate}</TypoCaption>
        },
        ...expirationDates
      ]
    }
    return expirationDates
  }

  const setExpirationDate = useCallback(
    (expirationDateCode: string) => {
      const expirationDate: ExpirationDateOption = expirationDatesConfig.find(
        (expDate: ExpirationDateOption) => expDate.code === expirationDateCode
      ) as ExpirationDateOption
      updateCartCache((draft) => {
        draft.expirationDate = expirationDate?.expirationDate
        return draft
      })

      setSelectedExpirationDate(expirationDateCode)
    },
    [expirationDatesConfig, updateCartCache]
  )

  const handleExpirationDateSelection = useCallback(
    (activated: string, selectedIds: string) => {
      if (activated !== 'currentExpirationDate') {
        setExpirationDate(selectedIds)
      } else {
        setSelectedExpirationDate(selectedIds)
      }
    },
    [setExpirationDate]
  )

  const handleAddPayer = () => {
    dispatch(setPayerList(cart?.billToParties))
    props.openModal('SELECT_ADD_PAYER')
  }

  const handleRemovePayer = async (payerAccountId: string) => {
    const payerToRemove = cart?.billToParties.find(
      (payer: BillToParty) => payer.sapAccountId === payerAccountId
    ) as BillToParty

    const updatedPayerList: BillToParty[] =
      cart?.billToParties
        .filter((payer) => payer.sapAccountId !== payerAccountId)
        .map((payer: BillToParty) => {
          return payer.isPrimaryBillTo
            ? {
                ...payer,
                percentage: (payer.percentage as number) + (payerToRemove.percentage || 0)
              }
            : payer
        }) || []

    updateCartCache((draft) => {
      draft.billToParties = updatedPayerList
      return draft
    })

    dispatch(
      setNotification({
        open: true,
        message: t('common.payer_removal_success_message.label'),
        timeout: 5000,
        actionButtonProps: {
          label: t('common.undo.label'),
          onAction: handleUndoRemovePayer
        }
      })
    )
  }

  const handleUndoRemovePayer = () => {
    updateCartCache((draft) => {
      draft.billToParties = cart?.billToParties as BillToParty[]
      return draft
    })
  }

  const handleAdjustSplit = () => {
    props.openModal('ADJUST_SPLIT')
  }
  const handlePayerItemClick = (payerAccountId: string) => {
    const selectedPayer = cart?.billToParties.find(
      (payer: BillToParty) => payer.sapAccountId === payerAccountId
    ) as BillToParty
    props.openModal('SELECT_PAYMENT_TERMS', { selectedPayer })
  }

  const handleQuoteName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value
    setName(newName)
    if (cart && cart?.name !== newName) {
      updateCartCache((draft) => {
        draft.name = newName
        draft.expirationDate = cart.expirationDate
        return draft
      })
    }
  }

  const handleReviewQuote = async () => {
    if (!cart) return

    try {
      setQuoteUpdating(true)
      const [_updateCart, _updateDiscounts] = await Promise.all([
        updateCartAttributes({
          cartId: cart.code,
          attributes: {
            name: cart.name,
            grower: cart.grower,
            agentSapId: sapAccountId,
            expirationDate: formatDateWithTimezoneOffset(cart.expirationDate),
            billToParties: cart.billToParties
          }
        }).unwrap(),
        updateBrandDiscounts(),
        convertCartToQuote({ cartId: cart.code, skipQuotesRefetch: true }, { onFail: () => openModal('EXIT') })
      ])
    } catch (e) {
      console.error(e)
      setQuoteUpdating(false)
    }
  }

  const saveBrandDiscountEntries = (brandDiscount: Discount) => {
    setBrandDiscountEntries(
      brandDiscount.strategies
        .filter((brandDiscStrategy: Strategy) => brandDiscStrategy.selected)
        .map((strategy: Strategy) => {
          const bc: BrandDiscountEntry = {
            programName: strategy.programName as string,
            programId: strategy.strategyId as string,
            programCrop: '',
            discount: strategy.discountValue,
            discountType: strategy.discountUnit,
            tier: strategy.bayerTierId as string
          }
          return bc
        })
    )
  }

  const handleBrandDiscountChange = useCallback(
    (strategy: Strategy) => {
      let discountEntries = _.cloneDeep(brandDiscountEntries) || []
      if (!strategy.selected) {
        discountEntries = discountEntries.filter(
          (discEntry: BrandDiscountEntry) => discEntry.programName !== strategy.programName
        )
      } else {
        const existingBrandDiscountEntryIndex = discountEntries.findIndex(
          (brandDiscountEntry: BrandDiscountEntry) => brandDiscountEntry.programName === strategy.programName
        )
        if (existingBrandDiscountEntryIndex > -1) {
          discountEntries.splice(existingBrandDiscountEntryIndex, 1)
        }
        discountEntries.push({
          programName: strategy.programName as string,
          programId: strategy.strategyId as string,
          programCrop: '',
          discount: strategy.discountValue,
          discountType: strategy.discountUnit,
          tier: strategy.bayerTierId as string
        })
      }

      const brandDiscountStrategies: Strategy[] = brandDiscountData?.strategies.length
        ? _.cloneDeep(brandDiscountData?.strategies)
        : _.cloneDeep(brandDiscounts?.strategies as Strategy[])
      if (strategy.programName === PREPAY) {
        brandDiscountStrategies
          .filter((stgy: Strategy) => stgy.programName === PREPAY)
          .forEach((prepayStrategy: Strategy) => (prepayStrategy.selected = false))
      }
      brandDiscountStrategies[
        brandDiscountStrategies.findIndex((s: Strategy) => s.bayerTierId === strategy.bayerTierId)
      ] = strategy
      const updatedBC: Discount = {
        programName: brandDiscounts?.programName || '',
        strategies: brandDiscountStrategies
      }

      setBrandDiscountData(updatedBC)
      dispatch(setBrandDiscount(updatedBC))
      setBrandDiscountEntries(discountEntries)
    },
    [brandDiscountEntries, brandDiscountData, brandDiscounts, dispatch]
  )

  const updateBrandDiscounts = useCallback(
    async () =>
      new Promise((resolve) => {
        let brandDiscountsToAdd: BrandDiscountEntry[] = []
        let brandDiscountsToUpdate: BrandDiscountEntry[] = []
        let brandDiscountsToDelete: BrandDiscountEntry[] = []
        if (cart?.brandDiscounts) {
          // Brand discount is already available in the cart, add / update / delete discounts as appropriate
          brandDiscountsToUpdate =
            brandDiscountEntries?.filter(
              (newBrandDisc: BrandDiscountEntry) =>
                newBrandDisc.programName === PREPAY &&
                newBrandDisc.tier !==
                  cart.brandDiscounts?.find((cartBrandDisc: BrandDiscountEntry) => cartBrandDisc.programName === PREPAY)
                    ?.programTier?.bayerTierId
            ) || []

          const nonPrepayDiscountEntries = brandDiscountEntries?.filter(
            (discount: BrandDiscountEntry) => discount.programName !== PREPAY
          )
          const nonPrepayCartBrandDiscountEntries = cart.brandDiscounts
            ?.filter((cartBrandDisc: BrandDiscountEntry) => cartBrandDisc.programName !== PREPAY)
            .map((bc: BrandDiscountEntry) => {
              return {
                programName: bc.programName as string,
                programId: bc.programId as string,
                tier: bc.programTier?.bayerTierId as string,
                isActive: bc.isActive as boolean
              }
            })

          brandDiscountsToAdd =
            nonPrepayDiscountEntries?.filter(
              (newBrandDisc: BrandDiscountEntry) =>
                !nonPrepayCartBrandDiscountEntries.find(
                  (cartBrandDisc: BrandDiscountEntry) => cartBrandDisc.programId === newBrandDisc.programId
                )
            ) || []

          const reAddedNonPrepayDiscounts =
            nonPrepayDiscountEntries?.filter((newBrandDisc: BrandDiscountEntry) =>
              nonPrepayCartBrandDiscountEntries.find(
                (cartBrandDisc: BrandDiscountEntry) =>
                  cartBrandDisc.programId === newBrandDisc.programId && cartBrandDisc.isActive === false
              )
            ) || []

          brandDiscountsToUpdate.push(...reAddedNonPrepayDiscounts)

          brandDiscountsToDelete =
            nonPrepayCartBrandDiscountEntries.filter(
              (cartBrandDisc: BrandDiscountEntry) =>
                !nonPrepayDiscountEntries?.find(
                  (newBrandDisc: BrandDiscountEntry) => newBrandDisc.programId === cartBrandDisc.programId
                ) && cartBrandDisc.isActive === undefined // isActive has only 2 values - undefined or false. undefined is equivalent to true.
            ) || []
        } else {
          brandDiscountsToAdd = brandDiscountEntries || []
        }
        const updateAllBrandDiscounts = async (brandDiscountUpdates: (() => Promise<void>)[]) => {
          const failedRequests: (() => Promise<void>)[] = []
          const promises = brandDiscountUpdates.map((p) => p().catch(() => failedRequests.push(p)))
          await Promise.all(promises)
          if (!failedRequests.length) {
            resolve(null)
            dispatch(setContingency())
            dispatch(clearBrandDiscount())
            return
          }
          dispatch(
            setContingency({
              code: 'UPDATE_BRAND_DISCOUNTS_FAILED',
              displayType: 'alert',
              alertProps: {
                type: 'error',
                title: t('common.update_brand_discounts_failed.label'),
                description: t('common.refresh_page_to_fix.description'),
                variant: 'tonal',
                actionButtonProps: {
                  label: t('common.try_again.label'),
                  onClick: () => updateAllBrandDiscounts(failedRequests)
                }
              }
            })
          )
        }

        const brandDiscountUpdates: (() => Promise<void>)[] = []
        if (brandDiscountsToAdd.length) {
          brandDiscountUpdates.push(() =>
            addBrandDiscount({ cartId: cart?.code ?? '', discounts: brandDiscountsToAdd }).unwrap()
          )
        }
        if (brandDiscountsToUpdate.length) {
          brandDiscountUpdates.push(() =>
            updateBrandDiscount({ cartId: cart?.code ?? '', discounts: brandDiscountsToUpdate || [] }).unwrap()
          )
        }
        if (brandDiscountsToDelete.length) {
          brandDiscountUpdates.push(() =>
            deleteBrandDiscount({ cartId: cart?.code ?? '', discounts: brandDiscountsToDelete || [] }).unwrap()
          )
        }
        updateAllBrandDiscounts(brandDiscountUpdates)
      }),
    [
      addBrandDiscount,
      brandDiscountEntries,
      cart?.brandDiscounts,
      cart?.code,
      deleteBrandDiscount,
      dispatch,
      updateBrandDiscount,
      t
    ]
  )

  const getFarmerSalesOffice = useCallback(
    (sapSalesAreas: SapSalesArea[]) => {
      const salesArea = sapSalesAreas.filter(
        (item: SapSalesArea) => item.distributionChannel === orderConfig.distributionChannel
      )
      return salesArea.length > 0 ? salesArea[0].salesOffice : ''
    },
    [orderConfig.distributionChannel]
  )

  useEffect(() => {
    const farmer: Farmer = state?.farmer
    if (farmer && !cart?.billToParties) {
      dispatch(setRedirectToFarmers(true))
      updateCartCache((draft) => {
        draft.billToParties = [
          {
            isPrimaryBillTo: true,
            paymentTerm: 'Z725',
            percentage: 100,
            sapAccountId: farmer.sourceId,
            name: farmer.name,
            paymentTermDescription: 'Prepay/Standard Terms-Due July 25'
          }
        ]
        draft.grower = farmer.sourceId
        draft.growerStateCode = farmer.address[0].stateProvinceCode
        draft.growerCountyCode = farmer.address[0].countryCode
        draft.salesOffice = farmer.sapSalesAreas ? getFarmerSalesOffice(farmer.sapSalesAreas) : ''
        return draft
      })
    }

    setModalProps({
      headerActions: (
        <ModalTopBar
          title={
            inEditMode
              ? !props.showNonDiscretionaryDiscount
                ? t('quotes.edit_name_and_expiration.label')
                : t('common.adjust_brand_discounts.label')
              : t('quotes.create_quote.label')
          }
          exitIconButtonProps={{
            onClick: () => {
              dispatch(setContingency())
              if (inEditMode) {
                dispatch(clearBrandDiscount())
              }
              inEditMode ? openModal('EXIT') : openModal('ABANDON_QUOTE')
              if (cart && inEditMode) {
                updateCartCache((draft) => {
                  if (props?.originalName) {
                    draft.name = props.originalName
                  }
                  if (props?.originalExpirationDate) {
                    draft.expirationDate = new Date(props.originalExpirationDate)
                  }
                  return draft
                })
              }
              inEditMode ? openModal('EXIT') : openModal('ABANDON_QUOTE')
            }
          }}
        />
      ),
      footerActions: inEditMode ? (
        <Button
          variant='filled'
          className={styles.footer_apply_button}
          disabled={applyingChanges}
          label={t('common.apply.label')}
          onClick={async () => {
            setApplyingChanges(true)
            if (cart) {
              await updateCartAttributes({
                cartId: cart.code,
                attributes: {
                  name: cart.name,
                  grower: cart.grower,
                  agentSapId: sapAccountId,
                  cartType: 'QUOTE',
                  expirationDate: formatDateWithTimezoneOffset(cart?.expirationDate)
                }
              }).unwrap()
              await updateBrandDiscounts()
              await refetchCart() //Force refetching cart, as there is delay in auto refetch (by invalidating tags) in some instances.
              openModal('EXIT')
            }
          }}
        />
      ) : (
        <>
          {(cart?.entries || [])?.filter((e) => !!e.quantity).length > 0 && (
            <Button
              data-testId='review-quote-action'
              className={styles.footer_view_quote_button}
              variant='outlined'
              label={`${t('quotes.review_quote.label')}${interpunct}${
                cart?.entries?.filter((e) => !!e.quantity).length || 0
              } ${t('common.product.label', {
                count: cart?.entries?.filter((e) => !!e.quantity).length || 0
              })}`}
              disabled={quoteUpdating}
              onClick={handleReviewQuote}
            />
          )}
          <Button
            label={t('common.add_products.label')}
            className={styles.footer_add_products_button}
            disabled={quoteUpdating}
            onClick={async () => {
              dispatch(setSelectedProductCrop(crops[0])) //Set default selected crop tab to be the first one.
              if (cart) {
                updateCartAttributes({
                  cartId: cart.code,
                  attributes: {
                    name: cart.name,
                    expirationDate: formatDateWithTimezoneOffset(cart.expirationDate),
                    distributionChannel: orderConfig.distributionChannel,
                    division: orderConfig.division,
                    documentType: orderConfig.documentType,
                    grower: cart.grower,
                    salesOrg: orderConfig.salesOrg,
                    agentSapId: sapAccountId,
                    salesYear: orderConfig.salesYear,
                    billToParties: cart.billToParties,
                    stateCode: cart.growerStateCode,
                    county: cart.growerCountyCode,
                    salesOffice: cart.salesOffice,
                    salesDistrict: cart.salesDistrict,
                    salesGroup: cart.salesGroup,
                    cartType: 'QUOTE'
                  }
                }).unwrap()
                await updateBrandDiscounts()
                refetchCart() //Force refetching cart, as there is delay in auto refetch (by invalidating tags) in some instances.
              }
              openModal('SELECT_PRODUCTS')
            }}
          />
        </>
      )
    })

    if (cart) {
      const expireDate = cart.expirationDate ? cart.expirationDate : props.expirationDate
      if (expireDate) {
        if (inEditMode) {
          if (expireDate === props.originalExpirationDate) {
            setSelectedExpirationDate('currentExpirationDate')
          } else {
            const expirationDate: ExpirationDateOption = expirationDatesConfig.find((expDate: ExpirationDateOption) => {
              return getDateFromUTC(expDate.expirationDate, locale) === expireDate
            }) as ExpirationDateOption
            setSelectedExpirationDate(expirationDate?.code)
          }
        }
      } else {
        const expirationDate: ExpirationDateOption = expirationDatesConfig.find((expDate: ExpirationDateOption) => {
          return (
            getDateFromUTC(expDate.expirationDate, locale) === getDateFromUTC(new Date(cart.expirationTime), locale)
          )
        }) as ExpirationDateOption
        if (expirationDate) {
          setSelectedExpirationDate(expirationDate?.code)
        } else {
          setExpirationDate('two-week')
          setSelectedExpirationDate('two-week')
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cart,
    quoteUpdating,
    brandDiscountEntries,
    setModalProps,
    inEditMode,
    t,
    openModal,
    updateCartAttributes,
    sapAccountId,
    updateBrandDiscounts,
    convertCartToQuote,
    dispatch,
    updateCartCache,
    navigate,
    crops,
    orderConfig.distributionChannel,
    orderConfig.division,
    orderConfig.documentType,
    orderConfig.salesOrg,
    expirationDatesConfig,
    setExpirationDate,
    applyingChanges,
    state?.farmer,
    getFarmerSalesOffice
  ])

  useEffect(() => {
    if (cart?.brandDiscounts) {
      const updatedBrandDiscount: Discount = {
        programName: brandDiscounts?.programName || '',
        strategies:
          brandDiscounts?.strategies.map((brandStrategy: Strategy) => {
            return {
              ...brandStrategy,
              selected: !!cart?.brandDiscounts?.find(
                (cartBrandDisc: BrandDiscountEntry) =>
                  brandStrategy.strategyId === cartBrandDisc.programId &&
                  brandStrategy.bayerTierId === cartBrandDisc.programTier?.bayerTierId
              )
            }
          }) || []
      }
      setBrandDiscountData(updatedBrandDiscount)
      saveBrandDiscountEntries(updatedBrandDiscount)
    } else {
      setBrandDiscountData(brandDiscounts)
    }
  }, [brandDiscounts, cart?.brandDiscounts])

  useEffect(() => {
    if (savedBrandDiscount?.strategies.length) {
      setBrandDiscountData(savedBrandDiscount)
      saveBrandDiscountEntries(savedBrandDiscount)
    }
    if (cart?.name) {
      setName(cart.name)
    }
    if (cart?.expirationDate) {
      const expirationDate: ExpirationDateOption = expirationDatesConfig.find(
        (expDate: ExpirationDateOption) =>
          getDateFromUTC(new Date(expDate.expirationDate), locale) ===
          getDateFromUTC(new Date(cart?.expirationDate), locale)
      ) as ExpirationDateOption
      setSelectedExpirationDate(expirationDate?.code)
    }
  }, [cart?.expirationDate, cart?.name, expirationDatesConfig, locale, savedBrandDiscount])

  if (isBrandDiscountsError || isBrandDiscountsLoading || isBrandDiscountsFetching) {
    return (
      <>
        {(isBrandDiscountsLoading || isBrandDiscountsFetching) && (
          <Loading className={styles.loading} label={t('common.loading_discounts.label')} />
        )}
        {isBrandDiscountsError && (
          <Contingency
            className={styles.contingency}
            codes={['BRAND_DISCOUNTS_ERROR']}
            types={['messageWithAction']}
            contingency={{
              code: 'BRAND_DISCOUNTS_ERROR',
              displayType: 'messageWithAction',
              messageWithActionProps: {
                messageHeader: t('common.data_load_failed.label'),
                messageDescription: t('common.refresh_page_to_fix.description'),
                primaryButtonProps: {
                  variant: 'text',
                  label: t('common.try_again.label'),
                  onClick: refetchBrandDiscounts
                },
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
    <div className={styles['create-quote-section']}>
      {(!inEditMode || (inEditMode && !props.showNonDiscretionaryDiscount)) && (
        <>
          <div className={styles['name-title']}>
            <TypoOverline>{t('quotes.quote_name.label')}</TypoOverline>
          </div>
          <div className={styles['name-input-textfield']}>
            <Textfield
              helperText={t('common.optional.label')}
              helperTextPersistent
              placeholder={t('quotes.custom_quote_name.label')}
              dense
              counter
              maxlength={35}
              variant='outlined'
              fullWidth
              value={name || ''}
              onChange={handleQuoteName}
            />
          </div>
        </>
      )}
      {!inEditMode && (
        <div className={styles['billing-payer-list']}>
          <PayerList
            titleText={<TypoOverline>{t('common.billing.label')}</TypoOverline>}
            payerListData={cart?.billToParties || []}
            noBorder
            noPadding
            payerListItemProps={{
              enableLink: true,
              enableHover: true,
              onPayerItemClick: handlePayerItemClick,
              onRemovePayer: handleRemovePayer
            }}
            actionButtonProps={{
              onAddPayer: handleAddPayer,
              onAdjustSplit: handleAdjustSplit
            }}
          />
        </div>
      )}
      {(!inEditMode || (inEditMode && props.showNonDiscretionaryDiscount)) && brandDiscountData && (
        <div className={!inEditMode ? styles.non_discretionary_discount_section : ''}>
          <Contingency codes={['UPDATE_BRAND_DISCOUNTS_FAILED']} types={['alert']} />
          <NonDiscretionaryDiscount
            discountData={brandDiscountData as Discount}
            editModeProps={{ defaultPrepayDiscount: defaultPrepayQualification }}
            noBorder
            noPadding
            onDiscountChange={handleBrandDiscountChange}
          />
        </div>
      )}
      {(!inEditMode || (inEditMode && !props.showNonDiscretionaryDiscount)) && (
        <div className={styles['expiration-date-section']}>
          <div className={styles['expiration-date-title']}>
            <TypoOverline>{t('quotes.expiration_date.label')}</TypoOverline>
          </div>
          <div>
            <List
              items={getExpirationDateOption()}
              leadingBlockType='radio'
              selected={selectedExpirationDate}
              onAction={handleExpirationDateSelection}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateQuoteModal
