import { ReactNode, useEffect } from 'react'
import styles from './ProductDetails.module.scss'
import { DiscountListByEntry, List, ModalTopBar, ProductHeader } from '@gc/components'
import { Entry } from '@gc/types'
import { useTranslation } from 'react-i18next'

/* eslint-disable-next-line */
export interface ProductDetailsProps {
  entry: Entry
  setModalProps: (props: { headerActions?: ReactNode; footerActions?: ReactNode }) => void
  openModal: (a: string) => void
}

export function ProductDetails({ setModalProps, openModal, entry }: ProductDetailsProps) {
  const { t } = useTranslation()
  useEffect(() => {
    setModalProps({
      headerActions: (
        <ModalTopBar
          title={t('common.quoted_product.label')}
          exitIconButtonProps={{
            icon: 'close',
            onClick: () => {
              openModal('EXIT')
            }
          }}
        />
      )
    })
  }, [openModal, setModalProps, t])
  return (
    <div className={styles.container}>
      <ProductHeader
        entry={entry}
        unitOfMeasure={'unit'}
        minDiscount={0}
        maxDiscount={0}
        showRecommendedRange={false}
        showDiscountedPrice={true}
        showProductQuantity={true}
      />
      <List
        noHover
        items={[
          { overlineText: t('quote.send_to.label').toUpperCase() },
          { primaryText: entry.storageLocation?.locationName }
        ]}
      />
      <DiscountListByEntry title={t('common.applied_discounts.label')} entry={entry} />
    </div>
  )
}

export default ProductDetails
