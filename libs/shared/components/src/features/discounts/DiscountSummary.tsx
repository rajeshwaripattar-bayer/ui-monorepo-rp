import styles from './DiscountSummary.module.scss'
import { Strategy } from '@gc/types'
import { useTranslation } from 'react-i18next'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import { getCurrencyFormat } from '@gc/utils'
import { List } from '../..'
import { Card, CardContent, CardTitle, CardBody, CardActions } from '@element/react-card'
import { resolutions } from '@gc/constants'
import { useLocale, useScreenRes } from '@gc/hooks'
import { Button } from '@element/react-button'

/* eslint-disable-next-line */
export interface DiscountSummaryProps {
  title: string
  strategies: Strategy[]
  actionButtonProps?: {
    label: string
    onClick: () => void
  }
}

type ListItem = { id: number | string; primaryText: string; trailingBlock?: string | number; isTotal?: boolean }

export function DiscountSummary(props: DiscountSummaryProps) {
  const { t } = useTranslation()
  const locale = useLocale()
  const { strategies } = props
  const res = useScreenRes()
  const isSmallMobile = res <= resolutions.M599
  const getStyledListItems = (items: Array<ListItem>) =>
    items.map(({ id, trailingBlock, primaryText, isTotal = false }) => {
      return isTotal
        ? {
            id,
            primaryText: (
              <TypoSubtitle bold level={2}>
                {primaryText}
              </TypoSubtitle>
            ),
            trailingBlock: (
              <TypoSubtitle bold level={2}>
                {`-${trailingBlock}`}
              </TypoSubtitle>
            )
          }
        : {
            id,
            primaryText: <TypoCaption>{primaryText}</TypoCaption>,
            trailingBlock: <TypoCaption>{`-${trailingBlock}`}</TypoCaption>
          }
    })

  const getFormattedTotal = () => {
    let totalAmount: number = 0
    const currency: string = 'USD'
    strategies.forEach((strategy, i) => (totalAmount += strategy.discountValue))
    return getCurrencyFormat(currency, totalAmount, locale)
  }

  const getDiscountList = () => {
    const items: Array<ListItem> = []
    strategies.forEach((strategy, strategyId) =>
      items.push({
        id: strategyId,
        trailingBlock: getCurrencyFormat('USD', strategy.discountValue, locale),
        primaryText: strategy.name
      })
    )
    return items
  }

  const getDiscountSummary = () => {
    const discounts: Array<ListItem> = getDiscountList()

    discounts.push({
      id: 'total',
      primaryText: `${t('common.total.label')} ${props.title}`,
      trailingBlock: getFormattedTotal(),
      isTotal: true
    })

    return getStyledListItems(discounts)
  }

  return (
    <div className={styles.discount_summary_container}>
      <Card className={isSmallMobile ? styles.card_mobile : styles.card}>
        <CardContent>
          <CardTitle
            data-testid='discount-summary-title'
            className={styles.card_title}
            primaryText={
              <TypoSubtitle level={1} bold>
                {props.title}
              </TypoSubtitle>
            }
          />
          <CardBody>
            <List
              className={styles.discount_summary_list}
              listItemClassName={styles.discount_summary_listitem}
              items={getDiscountSummary()}
              divider
              noHover
            />
          </CardBody>
          {props.actionButtonProps && (
            <div>
              <CardActions
                className={isSmallMobile ? styles.card_actions_mobile : ''}
                actionButtons={
                  <Button
                    data-testid='adjust-discount-button'
                    variant='outlined'
                    onClick={props.actionButtonProps.onClick}
                    fullWidth={isSmallMobile}
                    className={styles.button}
                  >
                    {props.actionButtonProps.label}
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DiscountSummary
