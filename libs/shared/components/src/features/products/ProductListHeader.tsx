import { IconButtonProps } from '@element/react-icon-button'
import { resolutions } from '@gc/constants'
import { useLocale, useScreenRes } from '@gc/hooks'
import { getCurrencyFormat } from '@gc/utils'
import { useTranslation } from 'react-i18next'
import Band from '../../ui-common/band/Band'

/* eslint-disable-next-line */
export interface ProductListHeaderProps {
  icon?: string | React.ReactNode
  count: number
  crop: string
  averagePrice?: number
  currencyIso?: string
  containerClassName?: string
  trailingIconButtonProps?: IconButtonProps
}

export function ProductListHeader({
  count,
  crop,
  icon,
  averagePrice,
  currencyIso,
  trailingIconButtonProps
}: ProductListHeaderProps) {
  const { t } = useTranslation()
  const locale = useLocale()
  const res = useScreenRes()

  const isDesktop = res > resolutions.M1023
  const averagePriceLabel = `${
    isDesktop ? `${t('common.average_desktop.label')}:` : t('common.average_mobile.label')
  } ${getCurrencyFormat(currencyIso || 'USD', averagePrice || 0, locale)}/${t('common.ssu.label')}`
  return (
    <Band
      placement='list'
      iconProps={icon ? { icon } : undefined}
      primaryText={`${count} ${crop} ${t('common.product.label', { count })}`}
      secondaryText={averagePrice ? averagePriceLabel : ''}
      {...(trailingIconButtonProps ? { trailingIconButtonProps: [trailingIconButtonProps] } : {})}
    />
  )
}

export default ProductListHeader
