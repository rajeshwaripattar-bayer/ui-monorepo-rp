import { TypoSubtitle } from '@element/react-typography'
import { useCurrentCart, useSelectedAccount } from '@gc/hooks'
import { getCartId, setNotification, setPayerList, useCartQueries, useGlobalDispatch } from '@gc/redux-store'
import { BillToParty } from '@gc/types'
import React, { useEffect, useMemo, useState } from 'react'
import isEqual from 'react-fast-compare'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import PayerList from '../../features/payer-list/PayerList'
import styles from './BillingSection.module.scss'

export type BillingSectionActions = {
  openEditModal: (
    modalName: string,
    opts?: {
      selectedPayer?: BillToParty
    }
  ) => void
}

export type BillingSectionProps = {
  inEditMode: boolean
  isLoading: boolean
  editIsLoading: boolean
  billToParties?: Array<BillToParty>
  actions: BillingSectionActions
}

function _BillingSection({
  inEditMode,
  isLoading,
  editIsLoading,
  billToParties,
  actions: { openEditModal }
}: BillingSectionProps) {
  const { t } = useTranslation()
  const dispatch = useGlobalDispatch()
  const sapAccountId = useSelectedAccount().sapAccountId
  const [payerListData, setPayerListData] = useState<Array<BillToParty>>([])

  const { useUpdateCartAttributesMutation } = useCartQueries()
  const [updateCartAttributes] = useUpdateCartAttributesMutation()

  const cartId = useSelector(getCartId)
  const { data: cart } = useCurrentCart({
    skip: !cartId || editIsLoading || !inEditMode
  })

  const handleAdjustSplit = () => openEditModal('ADJUST_SPLIT')

  const handlePaymentTermClick = (sapAccountId: string) => {
    const selectedPayer = cart?.billToParties.find(
      (payer: BillToParty) => payer.sapAccountId === sapAccountId
    ) as BillToParty
    openEditModal('SELECT_PAYMENT_TERMS', { selectedPayer })
  }

  const handleUndoRemovePayer = async () => {
    return await updateCartAttributes({
      cartId: cart?.code as string,
      attributes: {
        name: cart?.name,
        grower: cart?.grower,
        agentSapId: sapAccountId,
        billToParties: cart?.billToParties
      }
    })
  }

  const handleAddPayer = () => {
    dispatch(setPayerList(cart?.billToParties))
    openEditModal('SELECT_ADD_PAYER')
  }

  const handleRemovePayer = async (payerAccountId: string) => {
    const payerToRemove = cart?.billToParties.find(
      (payer: BillToParty) => payer.sapAccountId === payerAccountId
    ) as BillToParty

    const updatedPayerList: BillToParty[] =
      cart?.billToParties
        .filter((payer) => payer.sapAccountId !== payerAccountId)
        .map((payer: BillToParty) => {
          return payer.isPrimaryBillTo
            ? {
                ...payer,
                percentage: (payer.percentage as number) + (payerToRemove.percentage || 0)
              }
            : payer
        }) || []

    await updateCartAttributes({
      cartId: cart?.code as string,
      attributes: {
        name: cart?.name,
        grower: cart?.grower,
        agentSapId: sapAccountId,
        billToParties: updatedPayerList
      }
    })

    dispatch(
      setNotification({
        open: true,
        message: t('common.payer_removal_success_message.label'),
        timeout: 5000,
        actionButtonProps: {
          label: t('common.undo.label'),
          onAction: handleUndoRemovePayer
        }
      })
    )
  }

  const actionButtonProps = inEditMode
    ? {
        onAddPayer: handleAddPayer,
        onAdjustSplit: handleAdjustSplit
      }
    : undefined

  const payerListItemProps = inEditMode
    ? {
        enableLink: true,
        enableHover: true,
        onRemovePayer: handleRemovePayer,
        onPayerItemClick: handlePaymentTermClick
      }
    : undefined

  const titleText = useMemo(
    () => (
      <TypoSubtitle level={1} bold>
        {t('common.billing.label')}
      </TypoSubtitle>
    ),
    [t]
  )

  useEffect(() => {
    if (isLoading) return
    setPayerListData((inEditMode ? cart?.billToParties : billToParties) ?? [])
  }, [cart?.billToParties, billToParties, inEditMode, isLoading])

  return (
    <div className={styles.container}>
      <PayerList
        titleText={titleText}
        payerListData={payerListData}
        actionButtonProps={actionButtonProps}
        payerListItemProps={payerListItemProps}
      />
    </div>
  )
}

export const BillingSection = React.memo(_BillingSection, isEqual)
