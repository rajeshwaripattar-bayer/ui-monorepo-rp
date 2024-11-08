import _ from 'lodash'

import type {
  BillToParty,
  Cart,
  Discount,
  Discounts,
  DiscretionaryBudget,
  DiscretionaryDiscount,
  DraftDiscretionaryDiscount,
  Entry,
  EntryBrandDiscount,
  Strategy
} from '@gc/types'
import { getConvertedValue, getCropCodeFromName } from '@gc/utils'

import { getAddedPayers } from '../selectors/cartSelectors'
import { cartSlice, extendedCartApiSlice } from '../slices/cartSlice'
import type { GlobalAppDispatch, GlobalRootState } from '../types'

export const setAddPayer = (payer: BillToParty) => (dispatch: GlobalAppDispatch, getState: () => GlobalRootState) => {
  const state = getState()
  const payerList: BillToParty[] = _.cloneDeep(getAddedPayers(state) || [])
  payerList.push(payer)
  dispatch(cartSlice.actions.setPayerList(payerList))
}

export const setRemovePayer =
  (payer: BillToParty) => (dispatch: GlobalAppDispatch, getState: () => GlobalRootState) => {
    const state = getState()
    const payerList: BillToParty[] = _.cloneDeep(getAddedPayers(state) || [])
    const updatedPayerList = payerList.filter(
      (statePayer: BillToParty) => statePayer.sapAccountId !== payer.sapAccountId
    )
    dispatch(cartSlice.actions.setPayerList(updatedPayerList))
  }

const getUniqDiscountValuesByStrategyAndEntry = (
  sameCropEntries: Entry[] | undefined | (Entry | undefined)[],
  draftDiscretionaryDiscounts: DraftDiscretionaryDiscount[] | undefined,
  programName: string,
  strategy: string
) => {
  const discountValues: number[] = [],
    discountTypes: string[] = []

  sameCropEntries?.forEach((e) => {
    const matching = e?.discretionaryDiscounts?.find(
      (d) => d.discountProgram.programName === programName && d.offerReason === strategy && d.isActive
    )
    const matchingDraftDiscount = draftDiscretionaryDiscounts?.find(
      (d) => d.program === programName && d.offerReason === strategy && d.entryNumber === e?.entryNumber
    )
    discountValues.push(
      (_.isNumber(matchingDraftDiscount?.discount) ? matchingDraftDiscount?.discount : matching?.discount) || 0
    )
    discountTypes.push(matching?.discountType || matchingDraftDiscount?.discountType || '')
  })
  return { discountValues: _.compact(_.uniq(discountValues)), discountTypes: _.uniq(discountTypes) }
}

const getDiscountValue = (discountType: string, discount: number, totalPrice: number) => {
  return discountType !== '%' ? discount : getConvertedValue(discount, '%', totalPrice)
}

const getDiscountPercentage = (discountType: string, discount: number, totalPrice: number) => {
  return discountType === '%' ? discount : getConvertedValue(discount, '$', totalPrice)
}

const getUpdatedNetPrices = (
  cart: Cart | undefined,
  currentEntry: Entry | undefined,
  discretionaryBudgets: DiscretionaryBudget[] | undefined,
  draftDiscretionaryDiscounts: DraftDiscretionaryDiscount[] | undefined
) => {
  const netPrices: {
    entryNumber: number
    price: number
  }[] = []

  const validSameCropEntries = cart?.entries?.filter((e) => e.cropCode === currentEntry?.cropCode && !e.rejected) || []
  validSameCropEntries.forEach((_entry) => {
    let netPrice = _entry.totalPricePerUnit?.value || 0
    discretionaryBudgets?.forEach(({ discountBuckets, programName }) => {
      discountBuckets.forEach(({ strategy }) => {
        let discountValue
        const cartDiscountItem = _entry.discretionaryDiscounts?.find(
          (d) => d.offerReason === strategy && d.discountProgram.programName === programName && d.isActive
        )
        const draftDiscountItem = draftDiscretionaryDiscounts?.find(
          (d) => d.entryNumber === _entry.entryNumber && d.offerReason === strategy && d.program === programName
        )

        if (draftDiscountItem) {
          const { discount, discountType } = draftDiscountItem
          if (discount > 0) {
            discountValue = getDiscountValue(discountType, discount, _entry?.totalPricePerUnit?.value || 1)
            netPrice -= discountValue
          }
        } else if (cartDiscountItem) {
          const { discount: cartDiscount, discountType: cartDiscountType } = cartDiscountItem
          discountValue = getDiscountValue(cartDiscountType, cartDiscount, _entry?.totalPricePerUnit?.value || 1)
          netPrice -= discountValue
        }
      })
    })
    const totalBrandDiscount =
      _entry?.brandDiscounts
        ?.filter((ebc: EntryBrandDiscount) => ebc.isActive)
        .map((entryBrandDisc: EntryBrandDiscount) => entryBrandDisc.discountPerUnit.value)
        .reduce((prev: number, next: number) => prev + next) || 0
    netPrices.push({
      entryNumber: _entry.entryNumber || -1,
      price: netPrice - totalBrandDiscount
    })
  })
  return netPrices
}

const getIsApplyAll = (
  cartState: GlobalRootState['cart'],
  strategyName: string,
  programName: string,
  quoteId: string,
  cropCode: string
) => {
  const discounts = cartState.appliedAllStage?.discounts || []
  return discounts.find(
    (d) => d.cropCode === cropCode && d.programName === programName && d.strategyName === strategyName
  )
}

export const setDiscretionaryDiscounts =
  (
    cart: Cart | undefined,
    discretionaryBudgets: DiscretionaryBudget[] | undefined,
    entry: Entry | undefined,
    quoteId: string
  ) =>
  (dispatch: GlobalAppDispatch, getState: () => GlobalRootState) => {
    dispatch(cartSlice.actions.setAppliedAllStage(quoteId))
    const result: Discounts = []
    const unitPrice = entry?.totalPricePerUnit?.value || 1
    discretionaryBudgets?.forEach((item) => {
      result.push({
        remainingBudget: item.remainingBudget,
        programName: item.programName,
        crop: item.crop || '',
        strategies: item.discountBuckets.map(({ strategy }) => {
          const newStrategy: Strategy = {
            name: strategy,
            recommendedDiscount: {
              low: 1,
              high: 10
            },
            displayDiscount: 0,
            discountValue: 0,
            discountPercentage: 0,
            discountUnit: '%',
            applyToAll: !!getIsApplyAll(getState().cart, strategy, item.programName, quoteId, entry?.cropCode || ''),
            programName: item.programName
          }

          const adjustStrategyValues = (
            existingDiscounts: DiscretionaryDiscount | DraftDiscretionaryDiscount | undefined
          ) => {
            if (!existingDiscounts) {
              return
            }
            const { discount, discountType } = existingDiscounts
            newStrategy.discountUnit = discountType
            newStrategy.discountValue = getDiscountValue(discountType, discount, unitPrice)
            newStrategy.discountPercentage = getDiscountPercentage(discountType, discount, unitPrice)
            newStrategy.displayDiscount = discountType === '%' ? discount : newStrategy.discountValue
          }

          adjustStrategyValues(
            entry?.discretionaryDiscounts?.find(
              (discount) =>
                discount.discountProgram.programName === item.programName &&
                discount.offerReason === strategy &&
                discount.isActive
            )
          )
          adjustStrategyValues(
            cart?.draftDiscretionaryDiscounts?.find(
              (d) =>
                d.program === item.programName && d.offerReason === strategy && d.entryNumber === entry?.entryNumber
            )
          )
          return newStrategy
        })
      })
    })

    const netPrices = getUpdatedNetPrices(cart, entry, discretionaryBudgets, cart?.draftDiscretionaryDiscounts)
    dispatch(cartSlice.actions.setNetUnitPrices(netPrices))
    const filteredByCrop = result.filter((item: Discount) => item.crop === getCropCodeFromName(entry?.cropName || ''))
    dispatch(cartSlice.actions.setDiscretionaryDiscounts(filteredByCrop))
  }

const getDiscretionaryDiscountItem = (
  entry: Entry,
  strategy: Strategy,
  discretionaryBudgets: DiscretionaryBudget[] | undefined,
  programName: string
) => {
  const cartDiscountItem = entry?.discretionaryDiscounts?.find(
    (d) => d.offerReason === strategy.name && d.discountProgram.programName === programName && d.isActive
  )
  return {
    itemNumber: cartDiscountItem?.itemNumber,
    isActive: cartDiscountItem ? cartDiscountItem.isActive : true,
    entryNumber: entry.entryNumber || -1,
    program: programName,
    brand: 'Channel',
    cropName: entry?.cropName || '',
    discDescription:
      discretionaryBudgets
        ?.find((b) => b.programName === programName)
        ?.discountBuckets.find((bucket) => bucket.strategy === strategy.name)?.tactics || '',
    offerReason: strategy.name,
    discount: strategy.discountUnit === '%' ? strategy.discountPercentage : strategy.discountValue,
    recDiscount: strategy.displayDiscount,
    discountType: strategy.discountUnit,
    totalDiscount: 1,
    status: 'PENDING'
  }
}
const isMatchingDraftDiscountItem = (
  d: DraftDiscretionaryDiscount,
  e: Entry,
  offerReason: string,
  programName: string
) => d.offerReason === offerReason && d.program === programName && d.entryNumber === e.entryNumber

export const updateDiscretionaryDiscounts =
  (
    cart: Cart | undefined,
    discretionaryBudgets: DiscretionaryBudget[] | undefined,
    entry: Entry | undefined,
    programName: string,
    strategy: Strategy,
    quoteId: string
  ) =>
  (dispatch: GlobalAppDispatch, getState: () => GlobalRootState) => {
    const state = getState()
    const unitPrice = entry?.totalPricePerUnit?.value || 1
    const newStrategy = { ...strategy }
    const { discretionaryDiscounts } = state.cart
    let strategyModified = false
    let onlyDiscountRateChanged = false
    let previousApplyAll: boolean | undefined

    const cloned = _.cloneDeep(discretionaryDiscounts)
    dispatch(
      cartSlice.actions.updateAppliedAllStage({
        cropCode: entry?.cropCode || '',
        quoteId,
        strategy
      })
    )

    // dispatch(set)
    cloned.forEach((discretionaryDiscount) => {
      const matchingStrategyIndex = discretionaryDiscount.strategies.findIndex(
        (s: Strategy) => s.name === newStrategy.name && s.programName === programName
      )

      if (matchingStrategyIndex !== -1) {
        strategyModified = !_.isEqual(
          discretionaryDiscount.strategies[matchingStrategyIndex],
          _.omit(newStrategy, 'rowIndex')
        )
        const previousDiscountUnit = discretionaryDiscount.strategies[matchingStrategyIndex].discountUnit
        previousApplyAll = discretionaryDiscount.strategies[matchingStrategyIndex].applyToAll
        const { displayDiscount, discountUnit, discountPercentage, discountValue, applyToAll } = newStrategy
        if (discountUnit !== previousDiscountUnit) {
          if (discountUnit === '%') {
            newStrategy.discountPercentage = displayDiscount
          } else {
            newStrategy.discountValue = displayDiscount
          }
          onlyDiscountRateChanged = true
        } else if (
          (((!discountPercentage || !discountValue) && _.isNumber(displayDiscount)) ||
            displayDiscount !== discountValue ||
            displayDiscount !== discountPercentage) &&
          (previousApplyAll === applyToAll || displayDiscount === 0)
        ) {
          // Adjust discountValue and discountPercentage as one of these conditions match
          // - Missing discountPercentage/discountValue and displayDiscount was added
          //    OR
          // - Display Discount was modified thus not matching with discountPercentage/discountValue
          // And
          // 1. ApplyAll was unchanged
          //    OR
          // 2. Display discount was made 0 or removed!

          newStrategy.discountValue = getDiscountValue(discountUnit, displayDiscount, unitPrice)
          newStrategy.discountPercentage = getDiscountPercentage(discountUnit, displayDiscount, unitPrice)
        }
        discretionaryDiscount.strategies[matchingStrategyIndex] = newStrategy
      }
    })
    dispatch(cartSlice.actions.setDiscretionaryDiscounts(cloned))

    if (strategyModified) {
      dispatch(
        extendedCartApiSlice.util.updateQueryData('getCurrentCart', cart?.code ?? '', (draft) => {
          const draftDiscretionaryDiscounts = draft.draftDiscretionaryDiscounts ? draft.draftDiscretionaryDiscounts : []
          const sameCropOtherEntries =
            cart?.entries?.filter((e) => e.cropCode === entry?.cropCode && entry.entryNumber !== e.entryNumber) || []
          const sameCropEntries = [entry, ...sameCropOtherEntries]
          const entries = newStrategy.applyToAll && _.isNumber(newStrategy.displayDiscount) ? sameCropEntries : [entry]

          entries?.forEach((entryItem: Entry | undefined) => {
            if (!entryItem || entry?.rejected) {
              return
            }
            const cartDiscountItem = entryItem?.discretionaryDiscounts?.find(
              (d) => d.isActive && d.offerReason === newStrategy.name && d.discountProgram.programName === programName
            )

            if (
              cartDiscountItem?.discount !== newStrategy.displayDiscount ||
              cartDiscountItem?.discountType !== newStrategy.discountUnit
            ) {
              const discretionaryDiscountItem = getDiscretionaryDiscountItem(
                entryItem,
                newStrategy,
                discretionaryBudgets,
                programName
              )
              const existingItemIndex = draftDiscretionaryDiscounts?.findIndex((d: DraftDiscretionaryDiscount) =>
                isMatchingDraftDiscountItem(d, entryItem, newStrategy.name, programName)
              )
              if (existingItemIndex !== -1) {
                draftDiscretionaryDiscounts[existingItemIndex] = discretionaryDiscountItem
              } else {
                draftDiscretionaryDiscounts.push(discretionaryDiscountItem)
              }
            } else {
              const existingItemIndex = draftDiscretionaryDiscounts?.findIndex((d: DraftDiscretionaryDiscount) =>
                isMatchingDraftDiscountItem(d, entryItem, newStrategy.name, programName)
              )
              if (existingItemIndex !== -1) {
                draftDiscretionaryDiscounts.splice(existingItemIndex, 1)
              }
            }
          })

          const { discountValues, discountTypes } = getUniqDiscountValuesByStrategyAndEntry(
            sameCropEntries,
            draftDiscretionaryDiscounts,
            programName,
            newStrategy.name
          )

          // Conditions to remove discount from other same crop entries - NOTICE this is operating on sameCrop_OTHER_Entries (entries expect current one)
          // 1. Apply all is false
          // 2. Only a change from % to $(or vice versa) not detected (This can only occur in Desktop as Segmented button is an independent action!!)
          if (!newStrategy.applyToAll && !onlyDiscountRateChanged) {
            sameCropOtherEntries?.forEach((entryItem: Entry | undefined) => {
              if (!entryItem) {
                return
              }

              const existingItemIndex = draftDiscretionaryDiscounts?.findIndex((d: DraftDiscretionaryDiscount) =>
                isMatchingDraftDiscountItem(d, entryItem, newStrategy.name, programName)
              )
              const matching = entryItem?.discretionaryDiscounts?.find(
                (d) => d.discountProgram.programName === programName && d.offerReason === newStrategy.name && d.isActive
              )
              if (existingItemIndex !== -1) {
                // Remove any draft discount entry for other entries
                draftDiscretionaryDiscounts.splice(existingItemIndex, 1)
              } else if (
                matching &&
                discountValues.length <= 1 &&
                discountTypes.length <= 1 &&
                previousApplyAll &&
                newStrategy.displayDiscount !== 0 // If new discount is 0, but applyAll is false, no need to remove from cart
              ) {
                // IF same discount value & unit is applied for same crop entries (draft entries + Cart entries combined) and user turned off applyAll (checking previousApplyAll is TRUE)
                //  Add new draft discount entry with 0 value to remove it from Cart as well.
                const discretionaryDiscountItem = getDiscretionaryDiscountItem(
                  entryItem,
                  { ...newStrategy, discountPercentage: 0, discountValue: 0 },
                  discretionaryBudgets,
                  programName
                )
                draftDiscretionaryDiscounts.push({
                  ...discretionaryDiscountItem,
                  itemNumber: matching.itemNumber
                })
              }
            })
          }

          draft.draftDiscretionaryDiscounts = draftDiscretionaryDiscounts.filter(
            (d) => d.discount !== 0 || !!d.itemNumber
          )

          const netPrices = getUpdatedNetPrices(cart, entry, discretionaryBudgets, draft.draftDiscretionaryDiscounts)
          dispatch(cartSlice.actions.setNetUnitPrices(netPrices))

          return draft
        })
      )
    }
  }
export const {
  setPayerList,
  setCartId,
  resetDiscretionaryDiscounts,
  setNetUnitPrices,
  addSaveInProgressEntry,
  removeSaveInProgressEntry,
  resetSaveInProgressEntry,
  setDraftEntry,
  setBrandDiscount,
  clearBrandDiscount,
  updateAppliedAllQuotes,
  discardAppliedAllCart,
  updateAppliedAllCart,
  discardAppliedAllStage,
  setAppliedAllStage,
  updateAppliedAllStage,
  modifyAppliedAllCartForNewEntries
} = cartSlice.actions
