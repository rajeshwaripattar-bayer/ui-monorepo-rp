import { FasteStore } from '@monsantoit/faste-lite-react'
import _ from 'lodash'

let fasteStore: FasteStore

export function setFasteStore(store: FasteStore) {
  fasteStore = store
}

export function getFasteStore() {
  return fasteStore
}

export function fetchStore(name: string) {
  return fasteStore?.fetch(name)?.value
}

export function updateStore(key: string, value: object) {
  fasteStore.update(key, { ...fetchStore(key), ...value })
}

export function fasteRoute(route: string, data?: object) {
  _.get(window, 'faste.route', (route: string, data?: object) => {})(route, {
    data
  })
}
