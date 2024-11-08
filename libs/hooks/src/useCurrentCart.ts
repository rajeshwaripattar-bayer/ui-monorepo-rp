import { useSelector } from 'react-redux'
import { useCallback, useMemo, useRef } from 'react'

import { getCartId, useCartQueries, useGlobalDispatch, extendedCartApiSlice as cartApi } from '@gc/redux-store'
import type { Cart, ContingencyProps, Entry } from '@gc/types'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { getMatchingCartEntryIndex } from '@gc/utils'

export const useCurrentCart = (options?: { skip?: boolean }) => {
  const cartId = useSelector(getCartId)
  const { useGetCurrentCartQuery } = useCartQueries()
  return useGetCurrentCartQuery(cartId, { skip: options?.skip })
}

export const useUpdateCartCache = () => {
  const dispatch = useGlobalDispatch()
  const cartId = useSelector(getCartId)
  const handler = useCallback(
    (handler: (data: Cart) => void) => {
      dispatch(cartApi.util.updateQueryData('getCurrentCart', cartId, handler))
    },
    [cartId, dispatch]
  )
  return [handler]
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
  const dispatch = useGlobalDispatch()
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
        if (response && response.isSuccess) {
          const { data } = response
          if (options?.updateCartCache && data && payload.skipCartRefetch) {
            data.cartModifications.forEach(({ entry }) => {
              if (_.isNumber(entry.entryNumber)) {
                updateCartEntry(entry)
              }
            })
          }
        }
        return new Promise((resolve) => resolve(response || { isSuccess: false })) as SaveEntriesResponse
      } else {
        const response = await updateEntry(
          {
            cartId: payload.cartId,
            data: orderEntries[0],
            skipCartRefetch: payload.skipCartRefetch
          },
          { dispatch, contingency: getContingency(retryEntryUpdate, cancelEntryUpdate) }
        )
        if (response && response.isSuccess) {
          const { data } = response
          if (options?.updateCartCache && data && payload.skipCartRefetch) {
            const { entry } = data
            if (_.isNumber(entry.entryNumber)) {
              updateCartEntry(entry)
            }
          }
        }

        return new Promise((resolve) => resolve(response || { isSuccess: false })) as SaveEntriesResponse
      }
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
