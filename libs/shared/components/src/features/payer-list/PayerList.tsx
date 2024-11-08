import styles from './PayerList.module.scss'
import { List } from '../../../src'
import { Card, CardTitle, CardContent, CardActions, CardBody } from '@element/react-card'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import { Badge } from '../../../src'
import { ReactNode, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@element/react-button'
import { BillToParty } from '@gc/types'
import { Icon } from '@element/react-icon'
import { IconButton } from '@element/react-icon-button'
import { resolutions } from '@gc/constants'
import { useScreenRes } from '@gc/hooks'
/* eslint-disable-next-line */
export interface PayerListProps {
  titleText: ReactNode
  payerListData: BillToParty[]
  noBorder?: boolean
  noPadding?: boolean
  payerListItemProps?: {
    enableLink?: boolean
    enableHover?: boolean
    onPayerItemClick?: (sapAccountId: string) => void
    onRemovePayer?: (sapAccountId: string) => void
  }
  actionButtonProps?: {
    onAddPayer: () => void
    onAdjustSplit: () => void
  }
}

export function PayerList(props: PayerListProps) {
  const { t } = useTranslation()
  const enableLinks = props.payerListItemProps?.enableLink ?? false
  const enableListItemHover = props.payerListItemProps?.enableHover ?? false
  const res = useScreenRes()
  const isSmallMobile = res <= resolutions.M599

  const handleRemoveClick = useCallback(
    (event: React.MouseEvent, sapAccountId: string) => {
      if (props?.payerListItemProps?.onRemovePayer) props?.payerListItemProps?.onRemovePayer(sapAccountId)
    },
    [props?.payerListItemProps]
  )

  const getPayerListData = useCallback(
    (payers: BillToParty[]) => {
      const items: Array<object> = []
      payers.forEach((payer: BillToParty) => {
        items.push({
          code: payer.sapAccountId,
          trailingBlockWithAction: !payer.isPrimaryBillTo && props.payerListItemProps?.onRemovePayer && (
            <span>
              <IconButton
                data-testid='remove-payer-icon'
                icon={'close'}
                onClick={(event: React.MouseEvent) => handleRemoveClick(event, payer.sapAccountId)}
              ></IconButton>
            </span>
          ),
          overlineText: payer.isPrimaryBillTo && (
            <Badge labelText={t('common.primary.label')} className={styles['overline-text-wrapper']} />
          ),
          primaryText: <TypoSubtitle level={2}>{`${payer.name} • ${payer.percentage}%`}</TypoSubtitle>,
          secondaryText: (
            <div className={styles['secondary-text-wrapper']}>
              <TypoCaption themeColor={enableLinks ? 'primary' : 'text-icon-on-background'}>
                <Icon icon='credit_card' iconSize={'xsmall'} className={styles['secondary-text-leading-icon']} />
                {`${payer.paymentTermDescription ?? payer.paymentTerm}`}
              </TypoCaption>
            </div>
          )
        })
      })
      return items
    },
    [enableLinks, handleRemoveClick, props.payerListItemProps?.onRemovePayer, t]
  )

  const buildActionButton = (dataTestId: string, buttonText: string, isFullWidth: boolean, onClick?: () => void) => {
    return (
      <Button
        data-testid={dataTestId}
        variant='outlined'
        onClick={onClick}
        fullWidth={isFullWidth}
        className={styles['button']}
      >
        {buttonText}
      </Button>
    )
  }

  const buildCardActions = () => {
    return (
      <div className={styles['card-actions-container']}>
        <div data-testid='leading-action-button' className={!isSmallMobile ? styles['leading-button'] : ''}>
          {buildActionButton(
            'add-payer-button',
            t('common.add_payer.label'),
            isSmallMobile,
            props?.actionButtonProps?.onAddPayer
          )}
        </div>
        {props.payerListData?.length > 1 && (
          <div data-testid='trailing-action-buttons' className={!isSmallMobile ? styles['trailing-buttons'] : ''}>
            {buildActionButton(
              'adjust-split-button',
              t('common.adjust_split.label'),
              isSmallMobile,
              props?.actionButtonProps?.onAdjustSplit
            )}
          </div>
        )}
      </div>
    )
  }
  return (
    <div className={styles['payer-list-container']}>
      <Card className={styles[props.noBorder ? 'card-no-border' : isSmallMobile ? 'card-mobile' : 'card']}>
        <CardContent>
          <CardTitle
            data-testid='title'
            className={
              props.noPadding ? `${styles['card-title']} ${styles['card-title-no-padding']}` : styles['card-title']
            }
            primaryText={props.titleText}
          />
          <CardBody className={styles[props.noPadding ? 'card-body-no-padding' : '']}>
            <List
              className={styles['payer-list-list']}
              items={getPayerListData(props.payerListData)}
              divider
              noHover={!enableListItemHover}
              listItemClassName={styles['payer-list-listitem']}
              onAction={props.payerListItemProps?.onPayerItemClick}
              trailingBlockType='image'
            />
          </CardBody>
          {props.actionButtonProps && (
            <div>
              <CardActions
                className={styles[isSmallMobile ? 'card-actions-mobile' : '']}
                actionButtons={buildCardActions()}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PayerList
