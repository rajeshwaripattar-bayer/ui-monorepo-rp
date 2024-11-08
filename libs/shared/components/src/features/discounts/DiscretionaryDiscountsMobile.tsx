import type { Discount, Strategy } from '@gc/types'
import styles from './DiscretionaryDiscountsMobile.module.scss'
import DiscountSection from './DiscountSection'
import { MessageWithAction } from '../../ui-common/message-with-action/MessageWithAction'
import { Card, CardTitle, CardContent } from '@element/react-card'
import { TypoSubtitle } from '@element/react-typography'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

/* eslint-disable-next-line */
export interface DiscretionaryDiscountsMobileProps {
  discountData: Discount[]
  onDiscountItemClick: (programName: string, strategy: Strategy) => void
}

export function DiscretionaryDiscountsMobile({
  discountData,
  onDiscountItemClick
}: Readonly<DiscretionaryDiscountsMobileProps>) {
  const { t } = useTranslation()
  const hasDiscountData = useMemo(() => discountData.length, [discountData])

  if (!hasDiscountData) {
    return (
      <Card className={styles.card}>
        <CardContent>
          <CardTitle
            data-testid='title'
            className={styles.card_title}
            primaryText={
              <TypoSubtitle level={1} bold>
                {t('common.discretionary_discounts.label')}
              </TypoSubtitle>
            }
          />
          <MessageWithAction
            messageHeader={'No budgets found'}
            iconProps={{
              icon: 'info_outline',
              variant: 'filled-secondary',
              className: 'lmnt-theme-secondary-200-bg'
            }}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      {discountData.map((discount: Discount, i) => (
        <div className={styles.discount_item} key={`${discount.crop}-${i}`}>
          <DiscountSection
            discountData={discount}
            discountItemProps={{
              enableHover: true,
              showBadge: true,
              onDiscountItemClick: onDiscountItemClick
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default DiscretionaryDiscountsMobile
