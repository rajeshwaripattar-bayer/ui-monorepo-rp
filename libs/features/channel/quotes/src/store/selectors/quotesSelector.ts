import type { RootState } from '../index'

export const getQuoteId = (state: RootState) => state.quotes.quoteId
export const getInEditMode = (state: RootState) => state.quotes.inEditMode
export const getInReviewMode = (state: RootState) => state.quotes.inReviewMode
export const getRedirectToFarmers = (state: RootState) => state.quotes.redirectToFarmers
