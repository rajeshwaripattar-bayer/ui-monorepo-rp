import {
  BrandDiscountEntry,
  CropLevelDetail,
  DiscDiscount,
  Discount,
  DiscountValue,
  DiscretionaryDiscount,
  DomainDefGcPortalConfig,
  Entry,
  EntryBrandDiscount,
  OrderDetails,
  OrderEntryCBUS,
  QuoteDetails,
  Strategy
} from '@gc/types'
import _ from 'lodash'
import { getConvertedValue } from './format'

const brandFamilyCodeMapper: { [key: string]: string } = {
  NATIONAL: 'NB',
  CHANNEL: 'CB'
}

export function getBrandCodeFromFamily(brandFamily: string) {
  return brandFamilyCodeMapper[brandFamily?.toUpperCase()]
}

const cropCodeMapper: { [key: string]: string } = {
  CORN: 'C',
  SOYBEAN: 'B',
  SORGHUM: 'S'
}

export function getCropCodeFromName(cropName: string) {
  return cropCodeMapper[cropName.toUpperCase()]
}

export function getBrandDiscounts(_brandDiscountEntries: BrandDiscountEntry[], brandDiscounts: Discount | undefined) {
  const brandDiscountEntries = _brandDiscountEntries
    .slice()
    .sort((prev: BrandDiscountEntry, next: BrandDiscountEntry) =>
      (prev.programId || '').localeCompare(next.programId || '')
    )
  const brandDiscountStrategies: Strategy[] = brandDiscountEntries.map((brandDisc: BrandDiscountEntry) => {
    const brandDiscountRef: Strategy = brandDiscounts?.strategies.find(
      (strategy: Strategy) =>
        strategy.strategyId === brandDisc.programId && strategy.bayerTierId === brandDisc.programTier?.bayerTierId
    ) as Strategy
    return {
      ...brandDiscountRef,
      name: `${brandDisc.programName} ${
        brandDisc.programTier?.paymentTypeCode
          ? '(' + brandDisc.programTier?.paymentTypeCode + ' - ' + (brandDiscountRef?.discountPercentage || 0) + '%)'
          : ''
      }`,
      discountValue: brandDisc.totalDiscount?.value || 0
    }
  })
  return brandDiscountStrategies
}

export function mapEntriesToProductsByCrop(
  entries: Entry[] | OrderEntryCBUS[],
  cropLevelDetails: CropLevelDetail[],
  cropList: DomainDefGcPortalConfig['cropList'],
  saveInProgressEntries?: Entry[]
) {
  const entriesByCrop = _.groupBy(
    entries?.filter((item: Entry | OrderEntryCBUS) => !item.rejected),
    'cropCode'
  ) as {
    [key: string]: QuoteDetails['entries']
  }
  const _data = _.map(entriesByCrop, (entries, crop) => {
    const products = entries.map((_entry) => {
      const entry = { ..._entry }
      const saveInProgressEntry = saveInProgressEntries?.find((e) => e.product.code === entry?.product.code) as Entry
      if (saveInProgressEntry) {
        entry.quantity = saveInProgressEntry.quantity || 0
      }
      const brandDiscounts =
        [...(entry.brandDiscounts || [])]
          ?.sort((prev: EntryBrandDiscount, next: EntryBrandDiscount) =>
            (prev.discountProgram?.programId || '').localeCompare(next.discountProgram?.programId || '')
          )
          .filter((d) => d.isActive)
          .map((bd: EntryBrandDiscount) => ({
            programName: bd.discountProgram.programName,
            strategy: {
              name: `${bd.discountProgram.programName} ${
                bd.discountProgram.programTier?.paymentTypeCode
                  ? '(' + bd.discountProgram.programTier?.paymentTypeCode + ' - ' + (bd?.discount || 0) + '%)'
                  : ''
              }`,
              displayDiscount: bd.discountPerUnit.value,
              discountValue: bd.discountPerUnit.value,
              discountPercentage: bd.discount,
              discountUnit: bd.discountPerUnit.priceType
            }
          })) || []
      const discretionaryDiscounts = entry.discretionaryDiscounts
        ? entry.discretionaryDiscounts
            ?.filter((d) => d.isActive)
            ?.map((d: DiscretionaryDiscount) => ({
              programName: d.discountProgram.programName,
              strategy: {
                name: d.offerReason,
                displayDiscount: d.discount,
                discountValue:
                  d.discountType === '%'
                    ? getConvertedValue(d.discount, '%', entry.totalPricePerUnit?.value || 1)
                    : d.discount,
                discountPercentage:
                  d.discountType === '%'
                    ? d.discount
                    : getConvertedValue(d.discount, '$', entry.totalPricePerUnit?.value || 1),
                discountUnit: d.discountType
              }
            }))
        : []
      const allProdDiscounts = [...brandDiscounts, ...discretionaryDiscounts]
      return {
        cropCode: entry.cropCode,
        cropName: entry.cropName,
        name: entry.product.name,
        code: entry.product.code,
        quantity: entry.quantity,
        totalDiscount: entry.totalDiscountPrice?.value || 0,
        discountedUnitPrice: entry.netPricePerUnit?.value || 0,
        discounts: allProdDiscounts,
        unitPrice: entry.totalPricePerUnit?.value,
        subTotal: entry.lineItemSubTotal?.value || 0,
        warehouse: { value: entry.storageLocation?.locationCode, text: entry.storageLocation?.locationName }
      }
    })

    const cropLevelSummary = cropLevelDetails?.find((c: { crop: string }) => c.crop === crop)
    const allDiscounts = entries.reduce(
      (acc, entry) => acc.concat(entry.discountValues ?? []),
      [] as { code: string; isoCode: string; value: number }[]
    )

    // eslint-disable-next-line no-unsafe-optional-chaining
    let discDiscounts: DiscDiscount[] = cropLevelSummary?.discounts ? [...cropLevelSummary?.discounts] : []
    if (discDiscounts && discDiscounts.length > 0) {
      discDiscounts = discDiscounts.sort((a: DiscDiscount, b: DiscDiscount) =>
        a.type > b.type ? 1 : a.type === b.type && a.programId > b.programId ? 1 : -1
      )
    }
    const dummyDiscount = {
      currencyIso: 'USD',
      currencySymbol: '$',
      formattedValue: '0',
      priceType: 'BUY',
      value: 0
    }
    const summary = {
      grossPrice: cropLevelSummary?.details.grossPrice?.value || 0,
      discount: cropLevelSummary?.details.discountPrice?.value || 0,
      discountPercentage: cropLevelSummary?.details.percentageDiscount || 0,
      discounts: allDiscounts.map((discount: DiscountValue) => {
        return {
          name: discount.code,
          value: discount.value
        }
      }),
      netPrice: cropLevelSummary?.details.netPrice?.value || 0,
      discretionaryDiscounts: discDiscounts || [],
      totalDiscretionaryDiscount: cropLevelSummary?.details.discounts || dummyDiscount,
      grossPriceDiscretionaryDiscount: cropLevelSummary?.details.grossPrice || dummyDiscount,
      netPriceDiscretionaryDiscount: cropLevelSummary?.details.netPrice || dummyDiscount
    }
    return {
      crop: entries[0]?.cropName || '',
      products,
      avgPrice: cropLevelSummary?.details.averagePricePerUnit.value || 0,
      summary
    }
  })
  const cropsNameList = cropList.map((item) => {
    return item.cropName
  })
  return _data.sort((a, b) => cropsNameList.indexOf(a.crop) - cropsNameList.indexOf(b.crop))
}
