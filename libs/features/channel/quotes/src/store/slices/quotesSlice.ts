import { createSlice } from '@reduxjs/toolkit'

type QuotesState = {
  quoteId: string
  inEditMode: boolean
  inReviewMode: boolean
  redirectToFarmers: boolean
}

const initialState: QuotesState = {
  quoteId: '',
  inEditMode: false,
  inReviewMode: false,
  redirectToFarmers: false
}

const slice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    setQuoteId: (state, action) => {
      state.quoteId = action.payload
    },
    setInEditMode: (state, action) => {
      state.inEditMode = action.payload
    },
    setInReviewMode: (state, action) => {
      state.inReviewMode = action.payload
    },
    setRedirectToFarmers: (state, action) => {
      state.redirectToFarmers = action.payload
    }
  }
})

export const { setQuoteId, setInEditMode, setInReviewMode, setRedirectToFarmers } = slice.actions
export default slice.reducer
