import { ProductWithPrice } from '@gc/components/types'
import { Entry } from '@gc/types'

const entryMatcher = (cartEntry: Entry, entry: Entry, skipLocationCheck = false) =>
  cartEntry.product.code === entry.product.code &&
  cartEntry.cropCode === entry.cropCode &&
  (cartEntry.storageLocation?.locationCode === entry.storageLocation?.locationCode || skipLocationCheck) &&
  !cartEntry.rejected

export const getMatchingCartEntry = (entries: Entry[] = [], entry: Entry, skipLocationCheck = false) =>
  entries.find((cartEntry) => entryMatcher(cartEntry, entry, skipLocationCheck))

export const getMatchingCartEntryIndex = (entries: Entry[] = [], entry: Entry, skipLocationCheck = false) =>
  entries.findIndex((cartEntry) => entryMatcher(cartEntry, entry, skipLocationCheck))

const entryMatcherUsingProduct = (cartEntry: Entry, product: ProductWithPrice, skipLocationCheck = false) =>
  cartEntry.product.code === product.code &&
  (cartEntry.storageLocation?.locationCode === product.warehouse?.value || skipLocationCheck) &&
  !cartEntry.rejected

export const getMatchingCartEntryUsingProduct = (
  entries: Entry[] = [],
  product: ProductWithPrice,
  skipLocationCheck = false
) => entries.find((cartEntry) => entryMatcherUsingProduct(cartEntry, product, skipLocationCheck))

export const getMatchingCartEntryIndexUsingProduct = (
  entries: Entry[] = [],
  product: ProductWithPrice,
  skipLocationCheck = false
) => entries.findIndex((cartEntry) => entryMatcherUsingProduct(cartEntry, product, skipLocationCheck))
