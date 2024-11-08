import styles from './DiscountSection.module.scss'
import { Card, CardTitle, CardContent, CardBody } from '@element/react-card'
import { TypoCaption, TypoSubtitle, TypoOverline } from '@element/react-typography'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton } from '@element/react-icon-button'
import { Icon } from '@element/react-icon'
import { resolutions } from '@gc/constants'
import { useLocale, useScreenRes } from '@gc/hooks'
import { getCurrencyFormat, getRoundedValue } from '@gc/utils'
import { Discount, Strategy } from '@gc/types'
import List from '../../ui-common/list/List'
import Badge from '../../ui-common/badge/Badge'
import { Switch } from '@element/react-switch'
/* eslint-disable-next-line */
export interface DiscountSectionProps {
  discountData: Discount
  titleProps?: {
    hideTitle?: boolean
    isTitleOverline?: boolean
    noPadding?: boolean
  }
  noBorder?: boolean
  noPadding?: boolean
  discountItemProps?: {
    noDivider?: boolean
    enableHover?: boolean
    showDiscountDescription?: boolean
    showBadge?: boolean
    onDiscountItemClick?: (programName: string, strategy: Strategy) => void
    enableRemove?: boolean
    onRemoveDiscount?: (programName: string, strategy: Strategy) => void
    displaySwitch?: boolean
    onDiscountSelect?: (programName: string, strategy: Strategy) => void
    className?: string
  }
}

export function DiscountSection(props: DiscountSectionProps) {
  const { t } = useTranslation()

  const enableListItemHover = props.discountItemProps?.enableHover ?? false
  const res = useScreenRes()
  const isSmallMobile = res <= resolutions.M839
  const locale = useLocale()

  const handleRemoveClick = (event: React.MouseEvent, strategy: Strategy) => {
    if (props?.discountItemProps?.onRemoveDiscount)
      props?.discountItemProps?.onRemoveDiscount(props.discountData.programName, strategy)
  }

  const handleDiscountSelect = (isSelected: React.MouseEvent, strategy: Strategy) => {
    if (props.discountItemProps?.onDiscountSelect) {
      props.discountItemProps?.onDiscountSelect(props.discountData.programName, {
        ...strategy,
        selected: Boolean(isSelected)
      })
    }
  }

  const getDiscountData = useCallback(() => {
    const items: Array<object> = []
    props.discountData.strategies.forEach((strategy: Strategy) => {
      items.push({
        code: strategy,
        trailingBlock: props.discountItemProps?.onDiscountItemClick && !props.discountItemProps.enableRemove && (
          <span>
            <Icon
              className={styles.add_edit_icon}
              data-testid='add-discount-icon'
              icon={strategy.discountValue === 0 ? 'add_circle_outline' : 'edit'}
              variant='color-primary'
            ></Icon>
          </span>
        ),
        trailingBlockWithAction:
          (props.discountItemProps?.enableRemove && props.discountItemProps?.onRemoveDiscount && (
            <span>
              <IconButton
                data-testid='remove-discount-icon'
                icon={'close'}
                variant='color-primary'
                onClick={(event: React.MouseEvent) => handleRemoveClick(event, strategy)}
              ></IconButton>
            </span>
          )) ||
          (props.discountItemProps?.displaySwitch && props.discountItemProps.onDiscountSelect && (
            <span>
              <Switch
                hideLabel
                label=''
                disabled={!!strategy.disableDiscount}
                checked={!!strategy.selected}
                onChange={(isSelected: React.MouseEvent) => handleDiscountSelect(isSelected, strategy)}
              ></Switch>
            </span>
          )),
        overlineText: props.discountItemProps?.showBadge && strategy.discountValue > 0 && (
          <Badge labelText={t('common.applied.label')} className={styles.overline_text_wrapper} />
        ),
        primaryText: <TypoSubtitle level={2}>{`${strategy.name}`}</TypoSubtitle>,
        secondaryText: strategy.discountValue > 0 && (
          <div className={styles.secondary_text_wrapper}>
            <TypoCaption themeColor='text-icon-on-background'>
              {props.discountItemProps?.showDiscountDescription
                ? strategy.discountDescription
                : `-${getRoundedValue(strategy.discountPercentage || 0).toFixed(2)}% (${getCurrencyFormat(
                    'USD',
                    strategy.discountValue ?? 0,
                    locale
                  )})`}
            </TypoCaption>
          </div>
        )
      })
    })
    return items
  }, [t, props, locale])

  return (
    <div className={styles.discount_container}>
      <Card className={props.noBorder ? styles.card_no_border : isSmallMobile ? styles.card_mobile : styles.card}>
        <CardContent>
          <CardTitle
            data-testid='title'
            className={`${styles.cart_title} ${props.noPadding ? styles.card_title_no_padding : ''} ${
              props.titleProps?.noPadding ? styles.card_title_no_top_bottom_padding : ''
            }`}
            primaryText={
              !props.titleProps?.hideTitle &&
              (props.titleProps?.isTitleOverline ? (
                <TypoOverline>{props.discountData.programName}</TypoOverline>
              ) : (
                <TypoSubtitle level={2} bold>
                  {props.discountData.programName}
                </TypoSubtitle>
              ))
            }
            secondaryText={
              props.discountData.remainingBudget && (
                <TypoCaption
                  data-testid='remaining_budget'
                  className={props.discountData.remainingBudget < 0 ? styles.warning_text : ''}
                >
                  {`${t('common.remaining_budget.label')} : ${getCurrencyFormat(
                    'USD',
                    getRoundedValue(props.discountData.remainingBudget) ?? 0,
                    locale
                  )}`}
                </TypoCaption>
              )
            }
          />
          <CardBody className={styles[props.noPadding ? 'card_body_no_padding' : '']}>
            <List
              className={props.discountItemProps?.className || styles.discount_strategy_list}
              items={getDiscountData()}
              divider={!props.discountItemProps?.noDivider}
              noHover={!enableListItemHover}
              listItemClassName={styles.discount_strategy_item}
              onAction={(strategy: any) => {
                if (props.discountItemProps?.onDiscountItemClick) {
                  props.discountItemProps.onDiscountItemClick(props.discountData.programName, strategy)
                }
              }}
              trailingBlockType='image'
            />
          </CardBody>
        </CardContent>
      </Card>
    </div>
  )
}

export default DiscountSection
