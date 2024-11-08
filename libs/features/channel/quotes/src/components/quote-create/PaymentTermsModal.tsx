import styles from './PaymentTermsModal.module.scss'
import type { BillToParty, PaymentTerm, PaymentTermConfig } from '@gc/types'
import { TypoSubtitle, TypoCaption } from '@element/react-typography'
import { useMemo, useCallback, type ReactNode, useEffect, useState, useRef } from 'react'
import { usePortalConfig, useSelectedAccount } from '@gc/hooks'
import { useTranslation } from 'react-i18next'
import { List } from '@element/react-list'
import { Badge, Contingency, ModalTopBar } from '@gc/components'
import { useGetPaymentTermsQuery } from '../../store/slices/configDataSlice'
import { useAppDispatch } from '../../store'
import { Button } from '@element/react-button'
import { getAddedPayers } from '../../store/selectors/cartSelector'
import { useSelector } from 'react-redux'
import { getInEditMode } from '../../store/selectors/quotesSelector'
import { useCurrentCart, useUpdateCartCache } from '../../hooks/useCurrentCart'
import { setAddPayer, setNotification, useUpdateCartAttributesMutation } from '@gc/redux-store'

export interface PaymentTermsModalProps {
  isAddPayer?: boolean
  selectedPayer: BillToParty
  setModalProps: (props: { headerActions?: ReactNode; footerActions?: ReactNode }) => void
  openModal: (a: string, options?: { selectedPayer?: BillToParty; isAddPayer?: boolean }) => void
}

export function PaymentTermsModal(props: PaymentTermsModalProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { data: paymentTermsData = [], error, refetch } = useGetPaymentTermsQuery()
  const [updatedPayer, setUpdatedPayer] = useState<BillToParty>(props.selectedPayer)
  const selectedPayerRef = useRef(props.selectedPayer)
  const addedPayers = useSelector(getAddedPayers)
  const inEditMode = useSelector(getInEditMode)
  const [updateCartCache] = useUpdateCartCache()
  const { data: cart } = useCurrentCart()
  const [updateCartAttributes] = useUpdateCartAttributesMutation()

  const sapAccountId = useSelectedAccount().sapAccountId
  const portalConfig = usePortalConfig() //Fetch portal config
  const paymentTermsConfig: PaymentTermConfig[] = portalConfig?.gcPortalConfig?.paymentTermsConfig
  const paymentTerms = useMemo(() => {
    const terms = paymentTermsData.map((term: PaymentTerm) => {
      const config = paymentTermsConfig.find((config: PaymentTermConfig) => {
        return config.paymentTerm === term.code
      })
      return {
        ...term,
        displayNotes: config
          ? `${
              config.paymentTermProgramNotes
                ? t(config.paymentTermProgramNotes)
                : `${t('common.due.label')} ${t(config.paymentDueMonth)} ${t(config.paymentDueDate)}`
            }`
          : ''
      }
    })
    return terms.map(
      (paymentTerm: PaymentTerm) => {
        return {
          id: paymentTerm.code,
          leadingBlockType: 'radio',
          primaryText: (
            <TypoSubtitle bold level={2}>
              {paymentTerm.description}
            </TypoSubtitle>
          ),
          secondaryText: paymentTerm.displayNotes && <TypoCaption>{paymentTerm.displayNotes}</TypoCaption>
        }
      },
      [paymentTermsConfig]
    )
  }, [paymentTermsConfig, t, paymentTermsData])

  const updateStoreWithPayer = useCallback(() => {
    const updatedPayerInfo = selectedPayerRef.current
    if (props.isAddPayer) {
      dispatch(setAddPayer(updatedPayerInfo))
    } else {
      updateCartCache((draft) => {
        const updatedPayerList = draft.billToParties.map((payer: BillToParty) =>
          payer.sapAccountId !== props.selectedPayer?.sapAccountId ? payer : updatedPayerInfo
        )
        draft.billToParties = updatedPayerList
        return draft
      })
      if (inEditMode) {
        const updatedPayerList = cart?.billToParties.map((payer: BillToParty) =>
          payer.sapAccountId !== props.selectedPayer?.sapAccountId ? payer : updatedPayerInfo
        )
        updateCartAttributes({
          cartId: cart?.code as string,
          attributes: {
            name: cart?.name,
            grower: cart?.grower,
            agentSapId: sapAccountId,
            billToParties: updatedPayerList
          }
        }).unwrap()
      }
      dispatch(
        setNotification({
          open: true,
          message: t('common.payment_terms_updated_message.label')
        })
      )
    }
  }, [dispatch, props, updateCartCache, updateCartAttributes, cart, inEditMode, sapAccountId, t])

  const handleAction = useCallback(
    (_activated: string, selectedIds: string) => {
      const selectedPaymentTerm: PaymentTerm = paymentTermsData.filter(
        (paymentTerm: PaymentTerm) => paymentTerm.code === selectedIds
      )[0]

      const payerTermsUpdated: BillToParty = {
        ...props.selectedPayer,
        paymentTerm: selectedPaymentTerm.code,
        paymentTermDescription: selectedPaymentTerm.description
      }
      setUpdatedPayer(payerTermsUpdated)
      selectedPayerRef.current = payerTermsUpdated
    },
    [paymentTermsData, props]
  )

  useEffect(() => {
    props.setModalProps({
      headerActions: (
        <ModalTopBar
          title={t('common.select_payment_terms.label')}
          exitIconButtonProps={{
            icon: inEditMode && !props.isAddPayer ? 'close' : 'arrow_back',
            onClick: () => {
              props.isAddPayer
                ? props.openModal('SELECT_ADD_PAYER')
                : inEditMode
                  ? props.openModal('EXIT')
                  : props.openModal('CREATE_QUOTE')
            }
          }}
        />
      ),
      footerActions: (
        <>
          <Button
            label={props.isAddPayer ? t('common.add_another_payer.label') : t('common.cancel.label')}
            variant='outlined'
            className={styles.footer_secondary_button}
            onClick={(_e) => {
              if (props.isAddPayer) {
                updateStoreWithPayer()
              }
              props.isAddPayer
                ? props.openModal('SELECT_ADD_PAYER')
                : inEditMode
                  ? props.openModal('EXIT')
                  : props.openModal('CREATE_QUOTE')
            }}
          />
          <Button
            label={
              props.isAddPayer
                ? `${t('common.adjust.label')} ${addedPayers.length + 1}-${t('common.way_split.label')}`
                : t('common.apply.label')
            }
            className={styles.footer_primary_button}
            onClick={(_e) => {
              updateStoreWithPayer()
              props.isAddPayer
                ? props.openModal('ADJUST_SPLIT')
                : inEditMode
                  ? props.openModal('EXIT')
                  : props.openModal('CREATE_QUOTE')
            }}
          />
        </>
      )
    })
  }, [addedPayers.length, inEditMode, props, t, updateStoreWithPayer])

  return (
    <div className={styles['payment-terms-container']}>
      {error ? (
        <Contingency
          codes={['DEFAULT']}
          types={['messageWithAction']}
          className={styles.contingency}
          contingency={{
            code: 'DEFAULT',
            displayType: 'messageWithAction',
            displayDefault: true,
            defaultMessageProps: { onTryAgainAction: refetch }
          }}
        />
      ) : (
        <>
          <div className={styles['farmer-name-section']}>
            {props.selectedPayer?.isPrimaryBillTo && <Badge labelText={t('common.primary.label')} />}
            <TypoSubtitle level={1} bold>
              {props.selectedPayer?.name}
            </TypoSubtitle>
          </div>
          <div>
            <List
              items={paymentTerms}
              leadingBlockType='radio'
              selected={updatedPayer.paymentTerm}
              onAction={handleAction}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default PaymentTermsModal
