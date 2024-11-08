import type { BillToParty, Entry } from '@gc/types'
import type { RootState } from '../index'
import type { Discount } from '@gc/types'

export const getAddedPayers = (state: RootState): BillToParty[] => state.cart.addedPayerList || []
export const getCartId = (state: RootState): string | undefined => state.cart?.cartId
export const getDiscretionaryDiscounts = (state: RootState): Discount[] => state.cart.discretionaryDiscounts
export const getNetUnitPrices = (
  state: RootState
): {
  entryNumber: number
  price: number
}[] => state.cart.netUnitPrices
export const getSaveInProgressEntries = (state: RootState): Entry[] => state.cart.saveInProgressEntries
export const getDraftEntry = (state: RootState) => state.cart.draftEntry
export const getBrandDiscount = (state: RootState): Discount | undefined => state.cart.brandDiscount
