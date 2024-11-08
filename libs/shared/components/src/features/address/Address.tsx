import { AddressInfo } from '@gc/types'
import styles from './Address.module.scss'
import { Typography } from '@element/react-typography'
import { useTranslation } from 'react-i18next'

/* eslint-disable-next-line */
export interface AddressProps {
  address: AddressInfo
  typographyType?: string
  className?: string
}

export function Address(props: AddressProps) {
  const { address, typographyType = 'body2', className } = props
  const { t } = useTranslation()
  return (
    <div className={className}>
      <Typography type={typographyType} className={styles.address}>
        <label>{address.addressee}</label>
        <label>{address.line1}</label>
        <label>{address.line2 && address.line2}</label>
        <label>{`${address.town}, ${address.region.isocodeShort} ${address.postalCode}`}</label>
        <label>{address.phone && `${t('common.telephone.label')}: ${address.phone}`}</label>
      </Typography>
    </div>
  )
}

export default Address
