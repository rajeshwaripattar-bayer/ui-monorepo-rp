import { Card, CardContent, CardTitle, CardBody } from '@element/react-card'
import styles from './AddressCardMobile.module.scss'
import { Address } from './Address'
import { AddressInfo } from '@gc/types'
import { TypoSubtitle } from '@element/react-typography'
import { ReactNode, isValidElement } from 'react'
/* eslint-disable-next-line */
export interface AddressCardMobileProps {
  title: ReactNode | string
  address: {
    addressInfo: AddressInfo
    typographyType?: string
  }
}

export function AddressCardMobile(props: AddressCardMobileProps) {
  const { title, address } = props
  return (
    <Card variant='outlined' className={styles.card}>
      <CardContent>
        <CardTitle primaryText={isValidElement(title) ? title : <TypoSubtitle level={1}>{title}</TypoSubtitle>} />
        <CardBody typographyType={address.typographyType || 'body2'} className={styles.card_body}>
          <Address address={address.addressInfo as AddressInfo} typographyType={address.typographyType ?? undefined} />
        </CardBody>
      </CardContent>
    </Card>
  )
}

export default AddressCardMobile
