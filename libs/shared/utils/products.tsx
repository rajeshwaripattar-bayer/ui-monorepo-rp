import { TypoSubtitle } from '@element/react-typography'
import { ProductsByCrop, StockOrderProductsByCrop } from '@gc/components/types'
import {
  CropLevelDetail,
  DiscDiscount,
  DiscountValue,
  DiscretionaryDiscount,
  DomainDefGcPortalConfig,
  Entry,
  EntryBrandDiscount,
  Locale,
  OrderEntryCBUS,
  StockOrderEntry
} from '@gc/types'
import _ from 'lodash'
import { getConvertedValue, getDateFromUTC, getMatchingCartEntry } from './index'

type ProductEntry = Entry | OrderEntryCBUS

type EntriesByCrop = {
  [key: string]: ProductEntry[]
}

export const getProductName = (productName: string) => <TypoSubtitle level={2}>{productName}</TypoSubtitle>

export const removeRejectedItems = (entries: Entry[] | OrderEntryCBUS[] | undefined = []) => {
  return entries.filter((item) => !item.rejected)
}

export const getProductsByCropFromEntries = (
  entries: ProductEntry[],
  saveInProgressEntries: ProductEntry[],
  cropLevelDetails: CropLevelDetail[],
  locale: Locale,
  cropList: DomainDefGcPortalConfig['cropList']
): ProductsByCrop[] => {
  const entriesByCrop = _.groupBy(removeRejectedItems(entries), 'cropCode') as EntriesByCrop

  const productsByCrop = _.map(entriesByCrop, (entries, crop) => {
    const products: ProductsByCrop['products'] = entries.map((_entry) => {
      const entry = { ..._entry } as ProductEntry
      const saveInProgressEntry = getMatchingCartEntry(saveInProgressEntries, entry)
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
                  ? '(' +
                    bd.discountProgram.programTier?.paymentTypeCode +
                    ' - ' +
                    getDateFromUTC(new Date(bd.discountProgram.programTier?.deadline || ''), locale) +
                    ' - ' +
                    (bd?.discount || 0) +
                    '%)'
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
                name: `${d.discountProgram.programName} - ${d.offerReason}`,
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

      const storageLocation = entry.storageLocation
      const wareHouseText = storageLocation?.locationName
        ? `${storageLocation?.locationCode} - ${storageLocation?.locationName}`
        : ''

      return {
        canView: (entry.product as Entry['product']).canView,
        canOrder: (entry.product as Entry['product']).canOrder,
        cropCode: entry.cropCode,
        cropName: entry.cropName || '',
        name: entry.product.name || '',
        code: entry.product.code,
        quantity: entry.quantity || 0,
        netQuantity: (entry as OrderEntryCBUS).netQuantity || 0,
        totalDiscount: entry.totalDiscountPrice?.value || 0,
        discountedUnitPrice: entry.netPricePerUnit?.value || 0,
        discounts: allProdDiscounts,
        unitPrice: entry.totalPricePerUnit?.value || 0,
        subTotal: entry.lineItemSubTotal?.value || 0,
        warehouse: {
          text: wareHouseText,
          value: storageLocation?.locationCode ?? ''
        },
        statusCounts: [
          { status: 'common.confirmed.label', count: (entry as OrderEntryCBUS).confirmedQuantity },
          { status: 'common.unconfirmed.label', count: (entry as OrderEntryCBUS).unconfirmedQuantity },
          { status: 'common.delivered.label', count: (entry as OrderEntryCBUS).deliveredQuantity },
          { status: 'common.returned.label', count: (entry as OrderEntryCBUS).returnQuantity },
          {
            status: 'common.remaining_to_deliver.label',
            count: (entry as OrderEntryCBUS).remainingToDeliverQuantity,
            isBold: true
          }
        ]
      }
    })

    const cropLevelSummary = cropLevelDetails?.find((c: { crop: string }) => c.crop === crop)
    const allDiscounts = entries.reduce(
      (acc, entry) => acc.concat(entry.discountValues ?? []),
      [] as { code: string; isoCode: string; value: number }[]
    )

    let discDiscounts: DiscDiscount[] = cropLevelSummary?.discounts
      ? [...cropLevelSummary.discounts.filter((d) => d.totalDiscount.value > 0)]
      : []
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
    const avgPricePerUnit =
      cropLevelSummary?.details.averagePricePerUnit && cropLevelSummary?.details.averagePricePerUnit.value
    return {
      crop: entries[0]?.cropName || '',
      products,
      avgPrice: avgPricePerUnit || 0,
      summary
    }
  })
  const cropNameList = cropList.map((item) => item.cropName)
  return productsByCrop.sort((a, b) => cropNameList.indexOf(a.crop) - cropNameList.indexOf(b.crop))
}

export const getProductsByCropFromStockOrderEntries = (
  entries: StockOrderEntry[],
  cropList: DomainDefGcPortalConfig['cropList']
): StockOrderProductsByCrop[] => {
  const entriesByCrop = _.groupBy(removeRejectedItems(entries), 'cropCode') as EntriesByCrop

  const productsByCrop = _.map(entriesByCrop, (entries) => {
    const products: StockOrderProductsByCrop['products'] = entries.map((_entry) => {
      const entry = { ..._entry } as StockOrderEntry
      const wareHouseText = entry.warehouse?.name ? `${entry.warehouse.code} - ${entry.warehouse.name}` : ''

      return {
        name: entry.product.name,
        quantity: entry.quantity,
        confirmedQuantity: entry.confirmedQuantity || 0,
        unconfirmedQuantity: entry.unconfirmedQuantity || 0,
        warehouse: { text: wareHouseText, value: entry.warehouse?.code || '' }
      }
    })

    return {
      products,
      count: 2,
      crop: entries[0]?.cropName ?? ''
    }
  })

  const cropNameList = cropList.map((item) => item.cropName)
  const cropNameIndexMap = new Map(cropNameList.map((name, index) => [name, index]))
  return productsByCrop.sort((a, b) => (cropNameIndexMap.get(a.crop) || 0) - (cropNameIndexMap.get(b.crop) || 0))
}

export const getUnconfirmedProductCount = (entries: StockOrderEntry[] | OrderEntryCBUS[]) => {
  return (
    entries.filter((entry) => _.isNumber(entry.unconfirmedQuantity) && entry.unconfirmedQuantity > 0 && !entry.rejected)
      .length || 0
  )
}
