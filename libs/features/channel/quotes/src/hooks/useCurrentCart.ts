import _ from 'lodash'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fasteRoute, getMatchingCartEntryIndex } from '@gc/utils'

import {
  useCurrentCart as useCurrentCartHook,
  useSelectedAccount,
  useUpdateCartCache as useUpdateCartCacheHook,
  useUser
} from '@gc/hooks'
import {
  clearProductFilters,
  setContingency,
  setProductSearchTerm,
  setProductSortBy,
  useQuotesQueries
} from '@gc/redux-store'
import { getCartId, getSaveInProgressEntries, setCartId, setNotification, useCartQueries } from '@gc/redux-store'
import type { Cart, ContingencyProps, CropLevelDetail, Entry } from '@gc/types'

import { useAppDispatch } from '../store'
import { setInEditMode, setInReviewMode, setRedirectToFarmers } from '../store/slices/quotesSlice'
import { getInReviewMode, getRedirectToFarmers } from '../store/selectors/quotesSelector'
import { useGetRecommendedRangeQuery, extendedApiSlice as discountApi } from '../store/slices/discountsSlice'
import { useNavigate } from 'react-router-dom'

/**
 * we are re-exporting here to help with the migration to our new redux-store system
 */
export const useCurrentCart = useCurrentCartHook
export const useUpdateCartCache = useUpdateCartCacheHook

// skipForCart true meaning RecommendedRange will wait until cart is synced with CC after entries got modified.
// skipForCart defaults to false will make sure every time useGetRecommendedRange is called, we will get RecommendedRange based on current cart data.
export const useGetRecommendedRange = (skipForCart = false) => {
  const cartId = useSelector(getCartId)
  const dispatch = useAppDispatch()
  const { data: cart, status, fulfilledTimeStamp } = useCurrentCart({ skip: !cartId })
  const userEmail = useUser().username
  const userName = useUser().name
  const sapAccountId = useSelectedAccount().sapAccountId
  const [cartEntries, setCartEntries] = useState<Entry[]>([])
  const [entriesChanged, setEntriesChanged] = useState(false)
  const [cartFetchedTime, setCartFetchedTime] = useState<typeof fulfilledTimeStamp>(fulfilledTimeStamp)
  // saveInProgress and cartFetchedTime are used to determine when changes to Cart entries are updated to CC, so we can refetch Recommended Range
  const saveInProgress = useSelector(getSaveInProgressEntries)

  const getAcronymIDFromCart = useCallback(
    (cropCode: string) => {
      if (cart?.entries) {
        const result: string[] = cart.entries
          .filter((entry: Entry) => entry.cropCode === cropCode)
          .map((entry: Entry) => entry.product.acronymID || '')
        return _.compact(result)
      }
      return []
    },
    [cart?.entries]
  )

  const getTreatmentsFromCart = useCallback(
    (cropCode: string) => {
      if (cart?.entries) {
        const result: string[] = cart.entries
          .filter((entry: Entry) => entry.cropCode === cropCode)
          .map((entry: Entry) => entry.product.specialTreatmentCode || '')
        return _.compact(result)
      }
      return []
    },
    [cart?.entries]
  )

  const getQtyUsingCropCode = useCallback(
    (cropCode: string) => {
      if (cart?.entries) {
        const result: number[] = cart.entries
          .filter((entry: Entry) => entry.cropCode === cropCode)
          .map((entry: Entry) => entry.quantity || 0)
        return result
      }
      return []
    },
    [cart?.entries]
  )

  const getRetailTotalFromCart = useCallback(
    (cropCode: string) => {
      if (cart?.cropLevelDetails) {
        return (
          cart.cropLevelDetails.filter((item: CropLevelDetail) => item.crop === cropCode)[0]?.details?.grossPrice
            ?.value || 0
        )
      }
      return 0
    },
    [cart?.cropLevelDetails]
  )

  useEffect(() => {
    if (!_.isEqual(cart?.entries, cartEntries) && cartFetchedTime !== fulfilledTimeStamp) {
      setCartFetchedTime(fulfilledTimeStamp)
      setCartEntries(cart?.entries || [])
      setEntriesChanged(true)
      dispatch(discountApi.util.invalidateTags(['RecommendedRange']))
    } else {
      setEntriesChanged(false)
    }
  }, [cart?.entries, cartEntries, cartFetchedTime, dispatch, fulfilledTimeStamp, status])

  return useGetRecommendedRangeQuery(
    {
      userName: [userName],
      userId: [userEmail],
      userSapId: [sapAccountId],
      primaryPayerSapId: cart ? cart.grower : '',
      treatmentsCorn: getTreatmentsFromCart('seed_corn'),
      treatmentsSoy: getTreatmentsFromCart('seed_soybean'),
      productsCorn: getAcronymIDFromCart('seed_corn'),
      productsSoy: getAcronymIDFromCart('seed_soybean'),
      quantitiesCorn: getQtyUsingCropCode('seed_corn'),
      quantitiesSoy: getQtyUsingCropCode('seed_soybean'),
      retailTotalCorn: getRetailTotalFromCart('seed_corn'),
      retailTotalSoy: getRetailTotalFromCart('seed_soybean'),
      brandDiscountsCorn: cart?.totalBrandDiscount?.value || 0,
      brandDiscountsSoy: cart?.totalBrandDiscount?.value || 0,
      mailingState: ['IA'], // TODO need to bring dynamically
      mailingCounty: ['KOSSUTH'], // TODO need to bring dynamically
      shippingState: ['IA'], // TODO need to bring dynamically
      shippingCounty: ['KOSSUTH'], // TODO need to bring dynamically
      legacyId: ['FALSE']
    },
    {
      skip: !cart || !!saveInProgress.length || (!entriesChanged && skipForCart)
    }
  )
}

type EntriesPayload = {
  cartId: string
  data: {
    orderEntries: {
      product: {
        code: string
      }
      quantity?: number
      storageLocationCode?: string
      entryNumber?: number
    }[]
  }
  skipCartRefetch?: boolean
  updateMethod?: 'POST' | 'PUT'
}

type SaveEntriesOptions = { updateCartCache?: boolean; contingencyType?: 'alert' | 'dialog'; onFail?: () => void }
type SaveEntriesResponse = Promise<{ isSuccess: boolean; data: unknown | undefined }>
export const useSaveEntries: () => [
  (payload: EntriesPayload, options?: SaveEntriesOptions) => SaveEntriesResponse,
  { isLoading: boolean; isError: boolean }
] = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { useUpdateCartEntryMutation, useUpdateCartEntriesMutation } = useCartQueries()
  const [updateEntry, entryUpdateResult] = useUpdateCartEntryMutation()
  const [updateEntries, entriesUpdateResult] = useUpdateCartEntriesMutation()

  const { retry: retryEntryUpdate, cancel: cancelEntryUpdate } = entryUpdateResult
  const entryUpdateResultRef = useRef<typeof entryUpdateResult>()
  entryUpdateResultRef.current = entryUpdateResult
  const { retry: retryEntriesUpdate, cancel: cancelEntriesUpdate } = entriesUpdateResult
  const entriesUpdateResultRef = useRef<typeof entriesUpdateResult>()
  entriesUpdateResultRef.current = entriesUpdateResult
  const onFailRef = useRef<() => void>()
  if (entriesUpdateResultRef.current?.error && onFailRef.current) {
    onFailRef.current()
    onFailRef.current = undefined
  }
  if (entryUpdateResultRef.current?.error && onFailRef.current) {
    onFailRef.current()
    onFailRef.current = undefined
  }

  const [updateCartCache] = useUpdateCartCache()
  const triggerFn = useCallback(
    async (payload: EntriesPayload, options?: SaveEntriesOptions) => {
      const {
        data: { orderEntries }
      } = payload
      const singleEntryUpdate = orderEntries.length === 1 && _.isNumber(orderEntries[0].entryNumber)
      onFailRef.current = options?.onFail
      const getContingency: (retryAction: () => void, cancelAction: () => void) => ContingencyProps = (
        retryAction,
        cancelAction
      ) => {
        const title =
          orderEntries.length === 1 ? t('common.save_product_failed.label') : t('common.save_products_failed.label')
        if (options?.contingencyType === 'alert') {
          return {
            code: 'UPDATE_ENTRY_FAILED',
            displayType: 'alert',
            onDismissAction: cancelAction,
            alertProps: {
              type: 'error',
              title,
              description: t('common.refresh_page_to_fix.description'),
              variant: 'tonal',
              actionButtonProps: {
                label: t('common.try_again.label'),
                onClick: retryAction
              }
            }
          }
        }
        // DEFAULT contingencyType will be dialog type
        return {
          code: 'UPDATE_ENTRY_FAILED',
          displayType: 'dialog',
          onDismissAction: cancelAction,
          dialogProps: {
            title,
            message: t('common.refresh_page_to_fix.description'),
            open: true,
            actionButtonProps: {
              label: t('common.try_again.label'),
              onAction: retryAction
            }
          }
        }
      }

      const updateCartEntry = (entry: Entry) => {
        updateCartCache((draft: Cart) => {
          draft.entries = draft.entries ?? []
          const matchingIndex = getMatchingCartEntryIndex(draft.entries, entry)
          if (matchingIndex !== -1) {
            draft.entries[matchingIndex] = entry
          } else {
            draft.entries.push(entry)
          }
          return draft
        })
      }

      if (!singleEntryUpdate || payload.updateMethod === 'POST') {
        const response = await updateEntries(payload, {
          dispatch,
          contingency: getContingency(retryEntriesUpdate, cancelEntriesUpdate)
        })
        if (response?.isSuccess) {
          const { data } = response
          if (options?.updateCartCache && payload.skipCartRefetch) {
            data?.cartModifications?.forEach(({ entry }) => {
              if (_.isNumber(entry.entryNumber)) {
                updateCartEntry(entry)
              }
            })
          }
        }
        return new Promise((resolve) => resolve(response || { isSuccess: false })) as SaveEntriesResponse
      }
      const response = await updateEntry(
        {
          cartId: payload.cartId,
          data: orderEntries[0],
          skipCartRefetch: payload.skipCartRefetch
        },
        { dispatch, contingency: getContingency(retryEntryUpdate, cancelEntryUpdate) }
      )
      if (response?.isSuccess) {
        const { data } = response
        if (options?.updateCartCache && data && payload.skipCartRefetch) {
          const { entry } = data
          if (_.isNumber(entry.entryNumber)) {
            updateCartEntry(entry)
          }
        }
      }

      return new Promise((resolve) => resolve(response || { isSuccess: false })) as SaveEntriesResponse
    },
    [
      cancelEntriesUpdate,
      cancelEntryUpdate,
      dispatch,
      retryEntriesUpdate,
      retryEntryUpdate,
      t,
      updateCartCache,
      updateEntries,
      updateEntry
    ]
  )

  return useMemo(
    () => [
      triggerFn,
      {
        isLoading: !!entryUpdateResultRef.current?.isLoading || !!entriesUpdateResultRef.current?.isLoading,
        isError: !!entryUpdateResultRef.current?.isError || !!entriesUpdateResultRef.current?.isError
      }
    ],
    [triggerFn]
  )
}

export const useSaveQuote: () => [(quoteId: string | undefined, redirectToFarmers?: boolean) => Promise<void>] = () => {
  const dispatch = useAppDispatch()
  const { useUpdateQuoteMutation } = useQuotesQueries()
  const [updateQuote, result] = useUpdateQuoteMutation()
  const { retry, cancel } = result
  const resultRef = useRef<typeof result>()
  resultRef.current = result

  const [updateCart] = useUpdateCartCache()
  const inReviewMode = useSelector(getInReviewMode)
  const { t } = useTranslation()
  return [
    async (quoteId: string | undefined, redirectToFarmers?: boolean) => {
      await updateQuote(
        {
          quoteId: quoteId || '',
          reqBody: { action: 'SUBMIT' }
        },
        {
          dispatch,
          contingency: {
            code: 'SAVE_QUOTE_FAILED',
            displayType: 'dialog',
            onDismissAction: cancel,
            dialogProps: {
              title: t('quotes.save_failed.label'),
              message: t('common.refresh_page_to_fix.description'),
              open: true,
              actionButtonProps: {
                label: t('common.try_again.label'),
                onAction: retry
              }
            }
          }
        }
      )
      if (resultRef.current?.error) {
        return Promise.reject(resultRef.current?.error)
      }
      updateCart(() => ({}))
      dispatch(setInEditMode(false))
      dispatch(setInReviewMode(false))
      dispatch(setCartId(undefined))
      !redirectToFarmers &&
        dispatch(
          setNotification({
            open: true,
            message: inReviewMode ? t('quotes.saved_quote.label') : t('quotes.updated_quote.label'),
            timeout: 5000
          })
        )
      return Promise.resolve()
    }
  ]
}

export const useConvertCartToQuote = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const inReviewMode = useSelector(getInReviewMode)
  const redirectToFarmers = useSelector(getRedirectToFarmers)

  const { data: cart } = useCurrentCart()
  const [updateCartCache] = useUpdateCartCache()
  const { useConvertCartToQuoteMutation } = useQuotesQueries()
  const [convertCartToQuote, { isError }] = useConvertCartToQuoteMutation()

  const onFailRef = useRef<() => void>()
  if (isError && onFailRef.current) {
    onFailRef.current()
    onFailRef.current = undefined
  }

  const triggerFn = useCallback(
    async (
      payload: { cartId: string; skipQuotesRefetch: boolean },
      options?: { savingAsDraft?: boolean; onFail?: () => void }
    ) => {
      onFailRef.current = options?.onFail
      const response = await convertCartToQuote(payload)
      if (response) {
        dispatch(clearProductFilters())
        dispatch(setProductSortBy(''))
        dispatch(setProductSearchTerm(''))
        updateCartCache(() => ({}))

        if (response.data) {
          if (options?.savingAsDraft) {
            dispatch(setCartId(undefined))
            dispatch(setInEditMode(false))
            dispatch(setInReviewMode(false))
            if (redirectToFarmers) {
              const primaryParty = cart?.billToParties.filter((p) => p.isPrimaryBillTo)
              if (primaryParty) {
                dispatch(setRedirectToFarmers(false))
                window.history.replaceState({ farmer: undefined }, '')
                fasteRoute(`/farmers/${primaryParty[0].sapAccountId}`)
              }
            } else if (inReviewMode) {
              navigate(-1)
            }
          } else {
            dispatch(setInReviewMode(true))
            navigate(`/${response.data.code}`)
          }
        } else if (response.error) {
          dispatch(
            setContingency({
              code: 'CONVERT_CART_TO_QUOTE_FAILED',
              displayType: 'dialog',
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              onDismissAction: () => {},
              dialogProps: {
                title: t('quotes.create_failed.label'),
                message: t('common.refresh_page_to_fix.description'),
                open: true,
                actionButtonProps: {
                  label: t('common.try_again.label'),
                  onAction: () => triggerFn(payload, options)
                }
              }
            })
          )
        }
      }
    },
    [cart?.billToParties, convertCartToQuote, dispatch, inReviewMode, navigate, redirectToFarmers, t, updateCartCache]
  )
  return [triggerFn]
}
