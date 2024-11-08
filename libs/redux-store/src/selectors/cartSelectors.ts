import { BillToParty, Discount, Entry } from '@gc/types'
import { GlobalRootState } from '../types'

export const getCartId = (state: GlobalRootState): string | undefined => state.cart?.cartId
export const getAddedPayers = (state: GlobalRootState): BillToParty[] => state.cart.addedPayerList || []
export const getDiscretionaryDiscounts = (state: GlobalRootState): Discount[] => state.cart.discretionaryDiscounts
export const getSaveInProgressEntries = (state: GlobalRootState): Entry[] => state.cart.saveInProgressEntries
export const getBrandDiscount = (state: GlobalRootState): Discount | undefined => state.cart.brandDiscount
export const getNetUnitPrices = (state: GlobalRootState): { entryNumber: number; price: number }[] =>
  state.cart.netUnitPrices
