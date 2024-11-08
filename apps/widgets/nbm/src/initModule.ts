// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="index.d.ts"/>

import { initI18n } from '@gc/shared/i18n'
import { setFasteStore } from '@gc/utils'
import { FasteStore } from '@monsantoit/faste-lite-react'

export const initFasteStore = (fasteStore: FasteStore) => {
  setFasteStore(fasteStore)
}

// Only call if widget has standalone initI18n (e.g. host does not provide a shared singleton initI18n)
export const initWidgetI18n = (appName: string) => {
  initI18n(appName)
}
