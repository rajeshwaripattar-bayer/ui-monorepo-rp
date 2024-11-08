import { Card, CardContent, CardTitle } from '@element/react-card'
import { Select } from '@element/react-select'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import { Badge, Table } from '@gc/components'
import { resolutions } from '@gc/constants'
import { useLocale, useScreenRes } from '@gc/hooks'
import { Discount, Strategy } from '@gc/types'
import { getCurrencyFormat, getDateFromUTC, getRoundedValue } from '@gc/utils'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DiscountSection from './DiscountSection'
import styles from './NonDiscretionaryDiscount.module.scss'

/* eslint-disable-next-line */
export interface NonDiscretionaryDiscountProps {
  discountData: Discount
  editModeProps?: {
    defaultPrepayDiscount: string
  }
  noBorder?: boolean
  noPadding?: boolean
  onDiscountChange?: (strategy: Strategy) => void
}

interface PrepayDiscount {
  discountCode: string
  discountName: string
  discountPercent: number
  displayDiscount: string
  programName: string
  bayerTierId: string
  deadline: string
}

export function NonDiscretionaryDiscount({
  discountData,
  editModeProps,
  onDiscountChange,
  noBorder,
  noPadding
}: NonDiscretionaryDiscountProps) {
  const res = useScreenRes()
  const isSmallMobile = res <= resolutions.M839
  const { t } = useTranslation()
  const locale = useLocale()
  const updatedDiscountData = useMemo(() => {
    return {
      ...discountData,
      strategies: discountData.strategies.filter((strategy: Strategy) => !strategy.isPrepayDiscount)
    }
  }, [discountData])

  const defaultPrepayDiscount = useMemo(
    () =>
      discountData.strategies.filter(
        (strategy: Strategy) =>
          strategy.isPrepayDiscount && strategy.name.includes(editModeProps?.defaultPrepayDiscount || '')
      ),
    [discountData.strategies, editModeProps?.defaultPrepayDiscount]
  )

  const formatDeadlineDate = useCallback(
    (deadline: string | undefined) => {
      return deadline ? getDateFromUTC(new Date(deadline), locale) : ''
    },
    [locale]
  )

  const getInitialPrepayDiscount = useCallback(() => {
    const prepay = discountData.strategies.filter(
      (strategy: Strategy) => strategy.isPrepayDiscount && strategy.selected
    )
    if (prepay?.length) {
      return `${prepay[0].name} - ${formatDeadlineDate(prepay[0].deadline)} (${prepay[0].discountPercentage}%)`
    } else {
      if (defaultPrepayDiscount?.length && onDiscountChange) {
        const defaultStrategy: Strategy = {
          ...defaultPrepayDiscount[0],
          selected: true
        }
        onDiscountChange(defaultStrategy)
      }
      return defaultPrepayDiscount?.length
        ? `${defaultPrepayDiscount[0].name} - ${formatDeadlineDate(defaultPrepayDiscount[0].deadline)} (${
            defaultPrepayDiscount[0].discountPercentage
          }%)`
        : ''
    }
  }, [discountData.strategies, defaultPrepayDiscount, formatDeadlineDate, onDiscountChange])

  const [prepayDiscount, setPrepayDiscount] = useState(getInitialPrepayDiscount)

  const handleDiscountSelect = (_programName: string, strategy: Strategy) => {
    if (onDiscountChange) onDiscountChange(strategy)
  }

  const prepayDiscounts: PrepayDiscount[] = discountData.strategies
    .filter((strategy: Strategy) => strategy.isPrepayDiscount)
    .map((strategy: Strategy) => {
      return {
        discountCode: strategy.strategyId || '',
        deadline: strategy.deadline || '',
        discountName: strategy.name,
        discountPercent: strategy.discountPercentage,
        displayDiscount: `${strategy.name} - ${formatDeadlineDate(strategy.deadline)} (${
          strategy.discountPercentage
        }%)`,
        programName: strategy.programName || '',
        bayerTierId: strategy.bayerTierId || ''
      }
    })

  const disablePrepayDiscount = (): boolean => {
    //TODO: Logic to disable prepay discount goes here
    return false
  }

  const headers = useMemo(
    () =>
      discountData
        ? [
            {
              header: t('common.discount.label'),
              accessor: 'name',
              widthPercentage: 84,
              disableSortBy: true,
              cellProps: { style: { paddingLeft: '24px' } },
              displayTemplate: (_value: unknown, discount: Strategy) => {
                return (
                  <>
                    {discount.name}&nbsp;
                    {!!discount.discountValue && discount.discountValue > 0 && (
                      <Badge labelText={t('common.applied.label')} />
                    )}
                  </>
                )
              }
            },
            {
              header: t('common.discount_percent_header.value'),
              accessor: 'discountPercent',
              widthPercentage: 8,
              align: 'right',
              disableSortBy: true,
              displayTemplate: (_value: unknown, discount: Strategy) =>
                discount.discountPercentage && (
                  <TypoCaption>{`${getRoundedValue(discount.discountPercentage).toFixed(2)} %`}</TypoCaption>
                )
            },
            {
              header: t('common.discount_value_header.label'),
              accessor: 'discountValue',
              widthPercentage: 8,
              align: 'right',
              disableSortBy: true,
              cellProps: { style: { paddingRight: '24px' } },
              displayTemplate: (_value: unknown, discount: Strategy) =>
                discount.discountValue && (
                  <TypoCaption>{getCurrencyFormat('USD', discount.discountValue ?? 0, locale)}</TypoCaption>
                )
            }
          ]
        : [],
    [discountData, locale, t]
  )

  const table = useMemo(() => {
    return (
      <Table<Strategy>
        data-testid='desktop-discount-table'
        className={styles.table}
        headers={headers}
        noBorder
        noHover
        data={updatedDiscountData.strategies}
      />
    )
  }, [headers, updatedDiscountData.strategies])

  return (
    <div className={styles.container}>
      {(isSmallMobile || editModeProps) && (
        <>
          <DiscountSection
            data-testid='discount-section'
            noBorder={noBorder}
            noPadding={noPadding}
            titleProps={{ isTitleOverline: !!editModeProps, noPadding: true }}
            discountData={updatedDiscountData}
            discountItemProps={{
              displaySwitch: !!editModeProps,
              onDiscountSelect: handleDiscountSelect,
              noDivider: !!editModeProps,
              showBadge: !editModeProps,
              showDiscountDescription: !!editModeProps,
              className: styles.strategy_list
            }}
          />
          {editModeProps && (
            <div className={styles.prepay_section}>
              <TypoSubtitle level={2}>{t('common.prepay_qualification_discount.label')}</TypoSubtitle>
              <Select
                className={styles.prepay_select}
                variant='outlined'
                options={prepayDiscounts}
                disabled={disablePrepayDiscount()}
                valueKey='displayDiscount'
                value={prepayDiscount}
                textKey='displayDiscount'
                onChange={(prepay: PrepayDiscount) => {
                  const selectedPrepayDiscount = prepayDiscounts.find(
                    (prepayDiscount: PrepayDiscount) => prepayDiscount.displayDiscount === prepay.displayDiscount
                  ) as PrepayDiscount
                  setPrepayDiscount(
                    `${selectedPrepayDiscount.discountName} - ${formatDeadlineDate(selectedPrepayDiscount.deadline)} (${
                      selectedPrepayDiscount.discountPercent
                    }%)`
                  )
                  handleDiscountSelect('Brand Discount', {
                    name: selectedPrepayDiscount.discountName,
                    deadline: selectedPrepayDiscount.deadline,
                    displayDiscount: selectedPrepayDiscount.discountPercent,
                    discountValue: selectedPrepayDiscount.discountPercent,
                    discountPercentage: selectedPrepayDiscount.discountPercent,
                    strategyId: selectedPrepayDiscount.discountCode,
                    programName: selectedPrepayDiscount.programName,
                    bayerTierId: selectedPrepayDiscount.bayerTierId,
                    discountUnit: '%',
                    isPrepayDiscount: true,
                    selected: true
                  })
                }}
              />
            </div>
          )}
        </>
      )}
      {!isSmallMobile && !editModeProps && (
        <Card className={styles.card}>
          <CardContent>
            <CardTitle
              data-testid='title'
              className={styles.card_title}
              primaryText={
                <TypoSubtitle level={1} bold>
                  {discountData.programName}
                </TypoSubtitle>
              }
            />
            {discountData && table}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default NonDiscretionaryDiscount
