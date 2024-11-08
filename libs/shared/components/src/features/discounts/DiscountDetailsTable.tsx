import { ProductWithPrice } from '@gc/components/types'
import { Strategy } from '@gc/types'
import styles from './DiscountDetailsTable.module.scss'
import { useLocale } from '@gc/hooks'
import { useTranslation } from 'react-i18next'
import { TypoCaption } from '@element/react-typography'
import { getCurrencyFormat, getRoundedValue } from '@gc/utils'
import Table from '../../ui-common/table/Table'

export interface DiscountDetailsTableProps {
  product: ProductWithPrice
  displayProductStatuses?: boolean
}

export function DiscountDetailsTable({ product, displayProductStatuses }: DiscountDetailsTableProps) {
  const { discounts = [], quantity, statusCounts } = product
  const { t } = useTranslation()
  const locale = useLocale()

  const headers = [
    {
      header: t('common.discount.label'),
      accessor: 'name',
      widthPercentage: 65
    },
    {
      header: t('common.discount_per_unit.value'),
      accessor: 'discountValue',
      widthPercentage: 20,
      align: 'right',
      displayTemplate: (_value: string, strategy: Strategy) =>
        strategy.discountValue && (
          <TypoCaption>-{getCurrencyFormat('USD', strategy.discountValue ?? 0, locale)}</TypoCaption>
        )
    },
    {
      header: t('common.total_discount.value'),
      widthPercentage: 20,
      align: 'right',
      displayTemplate: (_value: string, strategy: Strategy) => (
        <>
          -<TypoCaption>{getCurrencyFormat('USD', (strategy.discountValue ?? 1) * quantity, locale)}</TypoCaption>
          &nbsp;(
          <TypoCaption>-{`${getRoundedValue(strategy.discountPercentage || -1)}%`}</TypoCaption>)
        </>
      )
    }
  ]

  return discounts.length === 10 ? (
    <p>{t('common.no_discounts_for_product.description')}</p>
  ) : (
    <div className={styles.container}>
      {displayProductStatuses && (
        <div className={styles.status_table}>
          <Table
            data-testid='desktop-discount-table'
            style={{ border: 'none' }}
            headers={[
              {
                header: t('common.product_status.label'),
                accessor: ({ status, isBold = false }) => <TypoCaption bold={isBold}>{t(status)}</TypoCaption>
              },
              {
                header: '',
                accessor: ({ count = 0, isBold = false }) => <TypoCaption bold={isBold}>{count}</TypoCaption>,
                align: 'right'
              }
            ]}
            noBorder
            noHover
            data={statusCounts || []}
          />
        </div>
      )}
      <div className={styles.discounts_table}>
        <Table<Strategy>
          data-testid='desktop-discount-table'
          layout='block'
          style={{ border: 'none' }}
          headers={headers}
          noBorder
          noHover
          data={discounts.map((d) => d.strategy)}
        />
      </div>
    </div>
  )
}

export default DiscountDetailsTable
