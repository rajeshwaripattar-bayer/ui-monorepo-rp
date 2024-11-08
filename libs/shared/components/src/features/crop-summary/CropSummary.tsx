import styles from './CropSummary.module.scss'
import { cropLevelDetails } from '@gc/types'
import { useTranslation } from 'react-i18next'
import { TypoCaption, TypoSubtitle } from '@element/react-typography'
import { getCurrencyFormat } from '@gc/utils'
import { List } from '../../../src'
import { Card, CardContent, CardTitle, CardBody } from '@element/react-card'
import { resolutions } from '@gc/constants'
import { useLocale, useScreenRes } from '@gc/hooks'
import { useCallback } from 'react'

/* eslint-disable-next-line */
export interface CropSummaryProps {
  title: string
  cropLevelDetails: cropLevelDetails[]
  summaryFor: string // For Example Quote or Order
}

type ListItem = { id: number | string; primaryText: string; trailingBlock?: string | number; isTotal?: boolean }

export function CropSummary(props: CropSummaryProps) {
  const { t } = useTranslation()
  const locale = useLocale()
  const { cropLevelDetails, title, summaryFor } = props
  const res = useScreenRes()
  const isSmallMobile = res <= resolutions.M599

  const getFormattedTotal = useCallback(() => {
    let totalAmount: number = 0
    const currency: string = cropLevelDetails[0]?.details.currency || 'USD'
    cropLevelDetails.forEach((cropLevelDetail) => (totalAmount += cropLevelDetail.details.netPrice.value))
    return getCurrencyFormat(currency, totalAmount, locale)
  }, [cropLevelDetails, locale])

  const getCropList = useCallback(() => {
    const items: Array<ListItem> = []
    cropLevelDetails.forEach((cropLevelDetail, cropId) =>
      items.push({
        id: cropId,
        trailingBlock: getCurrencyFormat(
          cropLevelDetail.details.currency,
          cropLevelDetail.details.netPrice.value,
          locale
        ),
        primaryText: `${t('common.' + cropLevelDetail.crop + '.label')}  ${t('common.total.label')}`
      })
    )
    return items
  }, [cropLevelDetails, locale, t])

  const getCropSummary = useCallback(() => {
    const crops: Array<ListItem> = getCropList()
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
                  {trailingBlock}
                </TypoSubtitle>
              )
            }
          : {
              id,
              primaryText: <TypoCaption>{primaryText}</TypoCaption>,
              trailingBlock: <TypoCaption>{trailingBlock}</TypoCaption>
            }
      })
    crops.push({
      id: 'total',
      primaryText: `${summaryFor} ${t('common.total.label')}`,
      trailingBlock: getFormattedTotal(),
      isTotal: true
    })

    return getStyledListItems(crops)
  }, [getCropList, getFormattedTotal, t, summaryFor])

  return (
    <div className={styles['crop-summary-container']}>
      <Card className={styles[isSmallMobile ? 'card-mobile' : 'card']}>
        <CardContent>
          <CardTitle
            data-testid='summary-title'
            className={styles['card-title']}
            primaryText={
              <TypoSubtitle level={1} bold>
                {title}
              </TypoSubtitle>
            }
          />
          <CardBody>
            <List
              className={styles['crop-summary-list']}
              listItemClassName={styles['crop-summary-listitem']}
              items={getCropSummary()}
              divider
              noHover
            />
          </CardBody>
        </CardContent>
      </Card>
    </div>
  )
}

export default CropSummary
