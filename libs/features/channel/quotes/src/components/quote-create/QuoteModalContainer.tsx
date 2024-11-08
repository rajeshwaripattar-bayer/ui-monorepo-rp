import { Modal } from '@element/react-modal'
import { resolutions } from '@gc/constants'
import { useScreenRes } from '@gc/hooks'
import type { BillToParty, Entry, Product, Strategy } from '@gc/types'
import React, { useCallback, useEffect, useState, type ReactNode } from 'react'
import isEqual from 'react-fast-compare'
import { useCurrentCart } from '../../hooks/useCurrentCart'
import { useGetStorageLocationsQuery } from '../../store/slices/configDataSlice'
import AddDiscountsModal from '../quote-discounts/AddDiscountsModal'
import AbandonQuoteModal from './AbandonQuoteModal'
import AddDiscountQtyModal from '../quote-discounts/AddDiscountQtyModal'
import ProductDetails from '../quote-details/ProductDetails'
import { useGetBrandDiscountsQuery } from '../../store/slices/discountsSlice'
import { useSelector } from 'react-redux'
import { getInEditMode } from '../../store/selectors/quotesSelector'
import AdjustSplitModal from './AdjustSplitModal'
import CreateQuoteModal from './CreateQuoteModal'
import { FarmerList } from './FarmerList'
import PaymentTermsModal from './PaymentTermsModal'
import styles from './QuoteModalContainer.module.scss'
import SelectProductsModal from './SelectProductsModal'
import SelectQuantity from './SelectQuantity'

/* eslint-disable-next-line */
interface ModalState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ModalBody?: (props: any) => ReactNode
  props?: {
    isAddPayer?: boolean
    selectedPayer?: BillToParty
    product?: Product
    entry?: Entry
    strategies?: Strategy[]
  }
}

export interface QuoteModalContainerProps {
  open: boolean
  setOpen: (open: boolean) => void
  modalName?: string
  modalProps?: ModalState['props']
}

const modals: Record<string, ModalState> = {
  SELECT_FARMER: {
    ModalBody: FarmerList
  },
  CREATE_QUOTE: {
    ModalBody: CreateQuoteModal
  },
  SELECT_PAYMENT_TERMS: {
    ModalBody: PaymentTermsModal
  },
  SELECT_ADD_PAYER: {
    ModalBody: FarmerList,
    props: { isAddPayer: true }
  },
  ADJUST_SPLIT: {
    ModalBody: AdjustSplitModal
  },
  SELECT_PRODUCTS: {
    ModalBody: SelectProductsModal
  },
  SELECT_QUANTITY: {
    ModalBody: SelectQuantity
  },
  ABANDON_QUOTE: {
    ModalBody: AbandonQuoteModal
  },
  ADD_DISCOUNTS: {
    ModalBody: AddDiscountsModal
  },
  ADD_DISCOUNT_QTY: {
    ModalBody: AddDiscountQtyModal
  },
  PRODUCT_DETAILS: {
    ModalBody: ProductDetails
  }
}

export function QuoteModalContainer(props: QuoteModalContainerProps) {
  const { setOpen } = props
  const inEditMode = useSelector(getInEditMode)
  const res = useScreenRes()

  // Get current cart needs to execute only if current modal is SELECT_FARMER, meaning user is trying to create a new Quote.
  const { data: cart } = useCurrentCart({ skip: props.modalName !== 'SELECT_FARMER' })
  useGetStorageLocationsQuery(cart?.warehouse?.code || '', {
    skip: !cart?.warehouse?.code
  })
  useGetBrandDiscountsQuery(undefined, { skip: !inEditMode })

  const [modalProps, setModalProps] = useState<{ headerActions: ReactNode; footerActions?: ReactNode } | null>(null)
  const [modal, setModal] = useState<ModalState>({
    ...modals[props.modalName || 'SELECT_FARMER'],
    props: props.modalProps
  })

  const openModal = useCallback(
    (modalName: string, _props?: ModalState['props']) => {
      if (modalName === 'EXIT') {
        setOpen(false)
      } else {
        setModal({
          props: { ..._props },
          ...modals[modalName]
        })
      }
    },
    [setOpen]
  )

  useEffect(() => {
    openModal(props.modalName as string, props.modalProps)
  }, [openModal, props.modalName, props.modalProps])

  const getModalSize = () => {
    if (res <= resolutions.M719) {
      return 'fullscreen'
    }
    if (
      ((modal.ModalBody === SelectProductsModal || modal.ModalBody === AddDiscountsModal) &&
        res >= resolutions.M1023) ||
      (res >= resolutions.M719 && res <= resolutions.M1023)
    ) {
      return 'max'
    }

    return 'medium'
  }

  return (
    <Modal
      open={props.open}
      hideCloseIcon
      preventClose
      className={styles.create_quote_modal}
      modalSize={getModalSize()}
      initialFocus={'primary'}
      headerActions={modalProps?.headerActions}
      nextButton={modalProps?.footerActions}
    >
      <div style={res >= resolutions.M719 ? { height: '87vh' } : {}}>
        {modal.ModalBody && <modal.ModalBody setModalProps={setModalProps} {...modal.props} openModal={openModal} />}
      </div>
    </Modal>
  )
}

export default React.memo(QuoteModalContainer, isEqual)
