import FasteStore from '@monsantoit/faste-store'
import { setFasteStore } from '@gc/utils'
import { myCropPortalConfig as mockMyCropPortalConfig } from '@gc/shared/env'

const defaultState = {
  appSessionData: {}
}
const defaultDomainDef = [mockMyCropPortalConfig]

export const setupFasteStore = (preloadedState = defaultState, domainDef: object[] = defaultDomainDef) => {
  const fasteStore = new FasteStore()
  fasteStore.update('domainDef', Object.assign({}, ...domainDef))

  Object.entries(preloadedState).forEach(([key, value]) => {
    fasteStore.update(key, value)
  })

  setFasteStore(fasteStore)
  return fasteStore
}
