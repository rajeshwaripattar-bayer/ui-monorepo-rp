import { Farmer, FarmerActionType } from '@gc/types'
import { Dispatch, SetStateAction } from 'react'
import { fasteRoute } from '@gc/utils'
import { useTranslation } from 'react-i18next'
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'

type modalProps = {
  open: boolean
  title: string
  primaryButtonProps: { text: string }
  dismissiveButtonProps: { text: string }
  message: string
  onConfirmation: () => void
}
type listItem = { value: string; label: string; onClick: () => void }

export const useFarmerActions = (
  actions: FarmerActionType[],
  setModelProps?: Dispatch<SetStateAction<modalProps>>,
  dispatch?: ThunkDispatch<object, undefined, UnknownAction>
): { value: string; label: string; onClick: () => void }[] => {
  const { t } = useTranslation()

  const handleQuoteCreate = (farmer: Farmer) => {
    try {
      fasteRoute(`/quotes`, { farmer })
    } catch (error) {
      console.log('error while navigating to quote create page')
    }
  }
  const handleCreateOrder = (farmer: Farmer) => {
    console.log('Create Order was clicked', farmer)
  }
  const handleDelivery = (farmer: Farmer) => {
    console.log('Delivery was clicked', farmer)
  }
  const handleReturn = (farmer: Farmer) => {
    console.log('Return was clicked', farmer)
  }
  const allActions = {
    quote: { value: 'create', label: t('quotes.quote.label'), onClick: handleQuoteCreate },
    order: { value: 'order', label: t('orders.order.label'), onClick: handleCreateOrder },
    delivery: { value: 'delivery', label: t('farmers.delivery.label'), onClick: handleDelivery },
    return: { value: 'return', label: t('farmers.return.label'), onClick: handleReturn }
  }

  return actions.map((action) => allActions[action]) as listItem[]
}
