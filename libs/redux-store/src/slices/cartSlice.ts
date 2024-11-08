import { createSlice } from '@reduxjs/toolkit'

import {
  addBrandDiscountsMutation,
  addDiscretionaryDiscountsMultiEntryMutation,
  addDiscretionaryDiscountsMutation,
  deleteBrandDiscountsMutation,
  deleteCartEntryMutation,
  deleteCartMutation,
  deleteDiscretionaryDiscountsMultiEntryMutation,
  deleteDiscretionaryDiscountsMutation,
  getCurrentCartQuery,
  updateBrandDiscountsMutation,
  updateCartEntriesMutation,
  updateCartEntryMutation,
  updateCurrentAttributesMutation,
  updateDiscretionaryDiscountsMultiEntryMutation,
  updateDiscretionaryDiscountsMutation
} from '@gc/rtk-queries'
import _ from 'lodash'
import { BillToParty, Discount, Entry, InferQueryArg, InferResultType, Strategy } from '@gc/types'
import { ccApi } from '../rtk-apis'
import useMutationWithRetry from '../utils/useMutationWithRetry'

type AppliedAllForQuote = {
  quoteId: string
  discounts: {
    cropCode: string
    strategyName: string
    programName: string
  }[]
}

export type CartState = {
  cartId?: string
  addedPayerList: BillToParty[]
  discretionaryDiscounts: Discount[]
  currentEntryNetUnitPrice: number
  netUnitPrices: {
    entryNumber: number
    price: number
  }[]
  saveInProgressEntries: Entry[]
  brandDiscount: Discount | undefined
  appliedAllQuotes: AppliedAllForQuote[]
  appliedAllCart?: AppliedAllForQuote
  appliedAllStage?: AppliedAllForQuote
  draftEntry?: {
    quantity?: number
    storageLocation?: { value: string; text: string }
  }
}

const initialState: CartState = {
  addedPayerList: [],
  discretionaryDiscounts: [],
  currentEntryNetUnitPrice: -1,
  netUnitPrices: [],
  saveInProgressEntries: [],
  brandDiscount: undefined,
  appliedAllQuotes: []
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setPayerList: (state, action) => {
      state.addedPayerList = action.payload
    },
    setCartId: (state, action) => {
      state.cartId = action.payload
    },
    setDiscretionaryDiscounts: (state, action) => {
      state.discretionaryDiscounts = action.payload
    },
    resetDiscretionaryDiscounts: (state) => {
      state.discretionaryDiscounts = []
    },
    setNetUnitPrices: (state, action) => {
      state.netUnitPrices = action.payload
    },
    addSaveInProgressEntry: (state, action) => {
      if (!action.payload) {
        return
      }
      const matchingIndex = state.saveInProgressEntries?.findIndex(
        (e) => e.product.code === action.payload.product.code && e.cropCode === action.payload.cropCode
      )
      if (state.saveInProgressEntries && matchingIndex !== -1) {
        state.saveInProgressEntries[matchingIndex] = action.payload
      } else {
        state.saveInProgressEntries?.push(action.payload)
      }
    },
    removeSaveInProgressEntry: (state, action: { payload: Entry }) => {
      const matchingIndex = state.saveInProgressEntries?.findIndex(
        (e) => e.product.code === action.payload.product.code && e.cropCode === action.payload.cropCode
      )
      if (state.saveInProgressEntries && matchingIndex !== -1) {
        const es = [...state.saveInProgressEntries]
        es.splice(matchingIndex, 1)
        state.saveInProgressEntries = es
      }
    },
    resetSaveInProgressEntry: (state) => {
      state.saveInProgressEntries = []
    },
    setDraftEntry: (state, action) => {
      state.draftEntry = action.payload
    },
    setBrandDiscount: (state, action) => {
      state.brandDiscount = action.payload
    },
    clearBrandDiscount: (state) => {
      state.brandDiscount = undefined
    },
    updateAppliedAllQuotes: (state) => {
      const { appliedAllCart: applyAllForCart } = state
      if (applyAllForCart) {
        const matchingIndex = state.appliedAllQuotes.findIndex(
          (d) => applyAllForCart && d.quoteId === applyAllForCart.quoteId
        )
        if (matchingIndex !== -1) {
          state.appliedAllQuotes[matchingIndex] = applyAllForCart
        } else {
          state.appliedAllQuotes.push(applyAllForCart)
        }
      }
      state.appliedAllCart = undefined
    },
    discardAppliedAllCart: (state) => {
      state.appliedAllCart = undefined
    },
    updateAppliedAllCart: (state) => {
      state.appliedAllCart = state.appliedAllStage
      state.appliedAllStage = undefined
    },
    discardAppliedAllStage: (state) => {
      state.appliedAllStage = undefined
    },
    setAppliedAllStage: (state, action: { payload: string }) => {
      const { payload: quoteId } = action
      if (!state.appliedAllStage) {
        if (state.appliedAllCart) {
          state.appliedAllStage = state.appliedAllCart
        } else {
          const matching = state.appliedAllQuotes.find((a) => a.quoteId === quoteId)
          if (matching && !state.appliedAllStage) {
            state.appliedAllStage = {
              quoteId,
              discounts: matching.discounts || []
            }
          }
        }
      }
    },
    updateAppliedAllStage: (state, action: { payload: { quoteId: string; cropCode: string; strategy: Strategy } }) => {
      const { strategy, cropCode, quoteId } = action.payload
      const { name, programName } = strategy
      let applyAllForStage = state.appliedAllStage
      if (!applyAllForStage) {
        applyAllForStage = {
          quoteId,
          discounts: []
        }
      }
      const { discounts } = applyAllForStage
      const matchingIndex = discounts.findIndex(
        (d) => d.programName === strategy.programName && d.strategyName === strategy.name && d.cropCode === cropCode
      )
      if (strategy.applyToAll && strategy.displayDiscount !== 0) {
        if (matchingIndex !== -1) {
          // No need to do anything as its already tracked
          return
        } else {
          if (programName) {
            // Push this strategy
            discounts.push({
              cropCode,
              strategyName: name,
              programName
            })
            state.appliedAllStage = applyAllForStage
          }
        }
      } else {
        if (matchingIndex !== -1) {
          // Remove as its no longer apply all true
          discounts.splice(matchingIndex, 1)
          state.appliedAllStage = applyAllForStage
        }
      }
    },
    modifyAppliedAllCartForNewEntries: (
      state,
      action: { payload: { quoteId: string; newEntries: Entry[]; cartEntries: Entry[] } }
    ) => {
      const { cartEntries, newEntries, quoteId } = action.payload
      const newEntriesByCrop = _.groupBy(
        newEntries.filter((e) => !!e.quantity),
        'cropCode'
      )
      const cartEntriesByCrop = _.groupBy(
        cartEntries.filter((e) => !!e.quantity && !e.rejected),
        'cropCode'
      )
      const cropCodes: string[] = []
      Object.keys(newEntriesByCrop).forEach((key) => {
        const newAdded = _.difference(
          newEntriesByCrop[key]?.map((e) => e.product.code),
          cartEntriesByCrop[key]?.map((e) => e.product.code)
        ).length
        if (newAdded) {
          cropCodes.push(key)
        }
      })
      const applyAllForCart = state.appliedAllCart
        ? { ...state.appliedAllCart }
        : state.appliedAllQuotes.find((a) => a.quoteId === quoteId)
      if (applyAllForCart) {
        const filtered = applyAllForCart.discounts.filter((a) => !cropCodes.includes(a.cropCode))
        applyAllForCart.discounts = filtered
        state.appliedAllCart = applyAllForCart
      }
    }
  }
})

export const extendedCartApiSlice = ccApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCurrentCart: getCurrentCartQuery(builder),
    updateCartAttributes: updateCurrentAttributesMutation(builder),
    updateCartEntry: updateCartEntryMutation(builder),
    updateCartEntries: updateCartEntriesMutation(builder),
    deleteCart: deleteCartMutation(builder),
    deleteCartEntry: deleteCartEntryMutation(builder),
    addDiscretionaryDiscounts: addDiscretionaryDiscountsMutation(builder),
    updateDiscretionaryDiscounts: updateDiscretionaryDiscountsMutation(builder),
    deleteDiscretionaryDiscounts: deleteDiscretionaryDiscountsMutation(builder),
    addDiscretionaryDiscountsMultiEntry: addDiscretionaryDiscountsMultiEntryMutation(builder),
    updateDiscretionaryDiscountsMultiEntry: updateDiscretionaryDiscountsMultiEntryMutation(builder),
    deleteDiscretionaryDiscountsMultiEntry: deleteDiscretionaryDiscountsMultiEntryMutation(builder),
    addBrandDiscounts: addBrandDiscountsMutation(builder),
    updateBrandDiscounts: updateBrandDiscountsMutation(builder),
    deleteBrandDiscounts: deleteBrandDiscountsMutation(builder)
  })
})

type Endpoints = (typeof extendedCartApiSlice)['endpoints']
type Q<T extends keyof Endpoints> = InferQueryArg<Endpoints, T>
type R<T extends keyof Endpoints> = InferResultType<Endpoints, T>

export const useCartQueries = () => ({
  ...extendedCartApiSlice,
  useDeleteCartEntryMutation: useMutationWithRetry<Q<'deleteCartEntry'>, R<'deleteCartEntry'>>(
    useDeleteCartEntryMutation
  ),
  useUpdateCartAttributesMutation: useMutationWithRetry<Q<'updateCartAttributes'>, R<'updateCartAttributes'>>(
    useUpdateCartAttributesMutation
  ),
  useUpdateCartEntryMutation: useMutationWithRetry<Q<'updateCartEntry'>, R<'updateCartEntry'>>(
    useUpdateCartEntryMutation
  ),
  useUpdateCartEntriesMutation: useMutationWithRetry<Q<'updateCartEntries'>, R<'updateCartEntries'>>(
    useUpdateCartEntriesMutation
  )
})

export const {
  useGetCurrentCartQuery,
  useUpdateCartAttributesMutation,
  useUpdateCartEntryMutation,
  useUpdateCartEntriesMutation,
  useDeleteCartMutation,
  useDeleteCartEntryMutation,
  useAddDiscretionaryDiscountsMutation,
  useUpdateDiscretionaryDiscountsMutation,
  useDeleteDiscretionaryDiscountsMutation,
  useAddDiscretionaryDiscountsMultiEntryMutation,
  useUpdateDiscretionaryDiscountsMultiEntryMutation,
  useDeleteDiscretionaryDiscountsMultiEntryMutation,
  useAddBrandDiscountsMutation,
  useUpdateBrandDiscountsMutation,
  useDeleteBrandDiscountsMutation
} = extendedCartApiSlice
