import { createSlice } from '@reduxjs/toolkit'
import { Notification, ContingencyProps } from '@gc/types'

export type AppState = {
  notification: Notification
  contingency?: ContingencyProps
}

const initialState: AppState = {
  notification: { open: false, message: '' }
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setNotification: (state, action) => {
      state.notification = action.payload
    },
    setContingency: (state, action: { payload: ContingencyProps | undefined }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      state.contingency = action.payload as any
    }
  }
})

export const { setNotification, setContingency } = appSlice.actions
