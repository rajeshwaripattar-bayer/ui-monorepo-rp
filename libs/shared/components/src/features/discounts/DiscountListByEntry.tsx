import { ListItem } from '@element/react-list'
import styles from './DiscountListByEntry.module.scss'
import { TypoOverline } from '@element/react-typography'
import DiscountListByType from './DiscountListByType'
import { useMemo } from 'react'
import { Entry } from '@gc/types'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'

export interface DiscountListByEntryProps {
  title: string
  entry: Entry
}

export function DiscountListByEntry({ entry, title }: DiscountListByEntryProps) {
  const { t } = useTranslation()
  const discounts = useMemo(() => {
    const discounts = []
    const { discretionaryDiscounts, brandDiscounts } = entry

    const activeBrandDiscounts = brandDiscounts?.filter((d) => d.isActive) || []
    if (activeBrandDiscounts.length) {
      discounts.push({
        discountType: t('common.brand_discounts.label'),
        totalDiscountPerUnit: _.sumBy(activeBrandDiscounts, 'discountPerUnit.value'),
        strategies: activeBrandDiscounts.map(({ discountPerUnit, discountProgram, totalDiscount }) => ({
          name: discountProgram.programName,
          programName: discountProgram.programName,
          discountValue: discountPerUnit.value,
          total: totalDiscount.value
        }))
      })
    }

    const activeDiscretionaryDiscounts = discretionaryDiscounts?.filter((d) => d.isActive) || []
    if (activeDiscretionaryDiscounts.length) {
      discounts.push({
        discountType: t('common.discretionary_discounts.label'),
        totalDiscountPerUnit: _.sumBy(activeDiscretionaryDiscounts, 'discountPerUnit.value'),
        strategies: activeDiscretionaryDiscounts.map(
          ({ discountPerUnit, offerReason, discountProgram, totalDiscount }) => ({
            name: offerReason,
            programName: discountProgram.programName,
            discountValue: discountPerUnit.value,
            total: totalDiscount.value
          })
        )
      })
    }
    return discounts
  }, [entry, t])

  if (!discounts.length) {
    return
  }

  return (
    <>
      <ListItem nonInteractive noHover className={styles.products_list_title}>
        <TypoOverline>{title}</TypoOverline>
      </ListItem>
      {discounts.map(({ strategies, totalDiscountPerUnit, discountType }, index: number) => (
        <DiscountListByType
          key={title + index}
          discountType={discountType}
          strategies={strategies}
          totalDiscountPerUnit={totalDiscountPerUnit}
          totalDiscount={totalDiscountPerUnit * (entry.quantity || 1)}
          currencyIso={entry.totalPricePerUnit?.currencyIso || 'USD'}
        />
      ))}
    </>
  )
}

export default DiscountListByEntry
