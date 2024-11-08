import { TypoSubtitle, TypoCaption } from '@element/react-typography'
import Band from '../../ui-common/band/Band'
import List from '../../ui-common/list/List'
import styles from './DiscountListByType.module.scss'
import { getCurrencyFormat } from '@gc/utils'
import { useLocale } from '@gc/hooks'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export interface DiscountListByTypeProps {
  discountType: string
  totalDiscountPerUnit: number
  totalDiscount: number
  strategies: {
    name: string
    programName: string
    discountValue: number
    total: number
  }[]
  currencyIso: string
}

export function DiscountListByType({
  discountType,
  totalDiscountPerUnit,
  totalDiscount,
  strategies,
  currencyIso
}: DiscountListByTypeProps) {
  const locale = useLocale()
  const { t } = useTranslation()

  const getStyledListItems = useCallback(() => {
    const items: Array<object> = []
    strategies.map(({ name, discountValue, total }) =>
      items.push({
        primaryText: <TypoSubtitle level={2}>{name}</TypoSubtitle>,
        secondaryText: (
          <TypoSubtitle level={2}>-{getCurrencyFormat(currencyIso, discountValue, locale)}/unit</TypoSubtitle>
        ),
        trailingBlockWithAction: (
          <span className={styles.trailing_info}>
            <TypoCaption>-{getCurrencyFormat(currencyIso, total, locale)}</TypoCaption>
          </span>
        )
      })
    )
    items.push({
      primaryText: (
        <TypoSubtitle bold level={2}>
          {t('common.total.label')}
        </TypoSubtitle>
      ),
      trailingBlockWithAction: (
        <span className={styles.trailing_info}>
          <TypoSubtitle bold level={2}>
            -{getCurrencyFormat(currencyIso, totalDiscount, locale)}
          </TypoSubtitle>
        </span>
      )
    })
    return items
  }, [t, locale, strategies, totalDiscount, currencyIso])

  return (
    <>
      <Band
        placement='list'
        primaryText={discountType}
        secondaryText={`-${getCurrencyFormat(currencyIso, totalDiscountPerUnit, locale)}/unit`}
      />
      <List noHover className={styles.list} items={getStyledListItems()} divider />
    </>
  )
}

export default DiscountListByType
