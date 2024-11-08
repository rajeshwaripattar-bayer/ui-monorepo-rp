import styles from './DiscretionaryDiscountsDesktop.module.scss'
import Table, { HeaderType } from '../../ui-common/table/Table'
import { MessageWithAction } from '../../ui-common/message-with-action/MessageWithAction'
import { Discounts, Strategy } from '@gc/types'
import { ProductLevelRange } from '@gc/types'
import { useTranslation } from 'react-i18next'
import { TypoSubtitle, TypoCaption } from '@element/react-typography'
import { getCurrencyFormat } from '@gc/utils'
import { useLocale } from '@gc/hooks'
import Badge from '../../ui-common/badge/Badge'
import { useCallback, useMemo } from 'react'
import Loading from '../../ui-common/loading/Loading'

type ModifiedStrategy = Omit<Strategy, 'displayDiscount'> & {
  displayDiscount: number | null
  productLevelRange: ProductLevelRange | null | undefined
}
/* eslint-disable-next-line */
export interface DiscretionaryDiscountsDesktopProps {
  discretionaryDiscounts: Discounts
  onChange: (programName: string, updatedStrategy: Strategy) => void
  cropName: string
  productRecDiscount?: ProductLevelRange | null
}

export function DiscretionaryDiscountsDesktop(props: DiscretionaryDiscountsDesktopProps) {
  const { onChange, cropName } = props
  const { t } = useTranslation()
  const locale = useLocale()

  const getHeaders = useCallback(
    (programName: string): HeaderType<ModifiedStrategy>[] => [
      {
        header: t('common.discount.label'),
        accessor: 'name',
        displayTemplate: (_value, strategy: ModifiedStrategy) => {
          const discount = strategy.displayDiscount || strategy.discountPercentage
          return (
            <>
              {strategy.name}&nbsp;
              {!!discount && discount > 0 && <Badge labelText={t('common.applied.label')} />}
            </>
          )
        },
        widthPercentage: 42,
        cellProps: { style: { paddingLeft: '24px' } }
      },
      {
        header: t('common.recommended_discount.label'),
        accessor: 'productLevelRange',
        displayTemplate: (_value, strategy: ModifiedStrategy) => {
          const loader = (
            <span className={styles.recommended_range_loading}>
              <Loading />
            </span>
          )
          if (strategy.productLevelRange === null) {
            return '--'
          } else {
            return strategy.discountUnit === '%'
              ? (strategy.productLevelRange?.RecDiscountPCT ?? loader)
              : (strategy.productLevelRange?.RecDiscount ?? loader)
          }
        },
        widthPercentage: 15,
        align: 'right'
      },
      {
        header: t('common.discount_rate.label'),
        accessor: 'displayDiscount',
        editProps: {
          editType: 'textfield' as const,
          textfieldProps: {
            type: 'number',
            placeholder: '0.00',
            decimalPlaces: 2,
            onWheel: (e: React.WheelEvent<HTMLElement>) => {
              e.currentTarget.blur()
            },
            onChange: (displayDiscount: string, strategy: ModifiedStrategy) =>
              onChange(programName, {
                ...strategy,
                displayDiscount: parseFloat(displayDiscount === '' ? '0.00' : displayDiscount)
              })
          }
        },
        widthPercentage: 15
      },
      {
        header: t('common.discount_unit.label'),
        accessor: 'discountUnit',
        editProps: {
          editType: 'segmentedButton',
          segmentedButtonProps: {
            buttonProps: { buttonSize: 'xsmall' },
            data: [
              { name: '%', value: '%' },
              { name: '$', value: 'USD' }
            ],
            onClick: (val: string, strategy: ModifiedStrategy) =>
              onChange(programName, { ...strategy, discountUnit: val } as Strategy)
          }
        },
        align: 'center',
        widthPercentage: 8
      },
      {
        header: `${t('common.apply_to_all.label')} ${cropName} ${t('common.product.label', {
          count: 2
        })}`,
        accessor: 'applyToAll',
        editProps: {
          editType: 'switch' as const,
          switchProps: {
            label: '',
            disabled: (rowData: ModifiedStrategy) => !rowData.displayDiscount,
            onChange: (checked: boolean, strategy: ModifiedStrategy) =>
              onChange(programName, { ...strategy, applyToAll: checked } as Strategy)
          }
        },
        align: 'center',
        widthPercentage: 15
      },
      {
        header: '',
        editProps: {
          editType: 'iconButton' as const,
          iconButtonProps: {
            iconProps: {
              icon: 'close'
            },
            iconButtonProps: {
              disabled: (rowData: ModifiedStrategy) => !rowData.displayDiscount,
              onClick: (strategy: ModifiedStrategy) => {
                onChange(programName, { ...strategy, displayDiscount: 0 } as Strategy)
              }
            }
          }
        },
        align: 'center',
        widthPercentage: 5,
        cellProps: { style: { paddingRight: '24px' } }
      }
    ],
    [onChange, cropName, t]
  )

  const getHeaderContent = useCallback(
    (programName: string, remainingBudget: number) => (
      <div className={styles.header}>
        <TypoSubtitle level={2} bold>
          {programName}
        </TypoSubtitle>
        <TypoCaption>
          {t('common.available_budget.label')}: {getCurrencyFormat('USD', remainingBudget, locale)}
        </TypoCaption>
      </div>
    ),
    [locale, t]
  )

  const renderTables = useMemo(
    () =>
      props.discretionaryDiscounts.map((discretionaryDiscount) => (
        <div key={discretionaryDiscount.programName}>
          <Table<ModifiedStrategy>
            data-testid='desktop-discretionary-discount-table'
            noHover
            className={styles.table}
            headers={getHeaders(discretionaryDiscount.programName)}
            data={discretionaryDiscount.strategies.map((s) => ({
              ...s,
              displayDiscount: s.displayDiscount === 0 ? null : s.displayDiscount,
              productLevelRange: props.productRecDiscount
            }))}
            style={{ border: 'none' }}
            containerProps={{ style: { overflowX: 'hidden' } }}
            customTopBar={getHeaderContent(
              discretionaryDiscount.programName,
              discretionaryDiscount.remainingBudget || 0
            )}
            editable={true}
          />
        </div>
      )),
    [getHeaderContent, getHeaders, props.discretionaryDiscounts, props.productRecDiscount]
  )

  return (
    <div className={styles['container']}>
      <div className={styles.sub_heading}>
        <TypoSubtitle bold level={1}>
          {t('common.discretionary_discounts.label')}
        </TypoSubtitle>
      </div>
      {props.discretionaryDiscounts.length ? (
        renderTables
      ) : (
        <MessageWithAction
          messageHeader={'No budgets found'}
          className={styles.no_data_msg}
          iconProps={{
            icon: 'info_outline',
            variant: 'filled-secondary',
            className: 'lmnt-theme-secondary-200-bg'
          }}
        />
      )}
    </div>
  )
}

export default DiscretionaryDiscountsDesktop
