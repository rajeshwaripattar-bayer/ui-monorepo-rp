import { Quote, QuoteDetails } from '@gc/types'
import { useTranslation } from 'react-i18next'
export type OrderActionType =
  | 'viewStatement'
  | 'edit'
  | 'duplicate'
  | 'shareWithFarmer'
  | 'print'
  | 'viewDetails'
  | 'cancelOrder'
  | 'downloadFarmerStatement'

// type modalProps = {
//   open: boolean
//   title: string
//   primaryButtonProps: { text: string }
//   dismissiveButtonProps: { text: string }
//   message: string
//   onConfirmation: () => void
// }
type listItem = { value: string; label: string; onClick: () => void }

export const useOrderActions = (
  actions: OrderActionType[]
): { value: string; label: string; onClick: () => void }[] => {
  const { t } = useTranslation()

  const handleEdit = () => {
    console.log('Edit was clicked')
  }

  const handleViewStatement = () => {
    console.log('Edit was clicked')
  }

  const handleDuplicate = () => {
    console.log('Duplicate was clicked')
  }

  const handleShareWithFarmer = (quote: Quote | QuoteDetails) => {
    console.log('Share with Farmer was clicked', quote)
  }

  const handleViewDetails = (quote: Quote | QuoteDetails) => {
    console.log('View Details was clicked', quote)
  }

  const handleCancelOrder = (quote: Quote | QuoteDetails) => {
    console.log('Cancel Order was clicked', quote)
  }

  const handleDownloadFarmerStatement = (quote: Quote | QuoteDetails) => {
    console.log('Download Farmer Statement was clicked', quote)
  }

  const handlePrint = async (quote: Quote) => {
    console.log('Print Order was clicked', quote)
  }

  const allActions = {
    edit: { value: 'edit', label: t('common.edit.label'), onClick: handleEdit },
    viewStatement: { value: 'view_statement', label: t('common.view_statement.label'), onClick: handleViewStatement },
    duplicate: { value: 'duplicate', label: t('common.duplicate.label'), onClick: handleDuplicate },
    shareWithFarmer: {
      value: 'shareWithFarmer',
      label: t('quotes.share_with_farmer.label'),
      onClick: handleShareWithFarmer
    },
    print: { value: 'print', label: t('common.print.label'), onClick: handlePrint },
    viewDetails: { value: 'viewDetails', label: t('common.view_details.label'), onClick: handleViewDetails },
    cancelOrder: { value: 'cancelOrder', label: t('common.cancel_order.label'), onClick: handleCancelOrder },
    downloadFarmerStatement: {
      value: 'downloadFarmerStatement',
      label: t('order.download_farmer_statement.label'),
      onClick: handleDownloadFarmerStatement
    }
  }

  return actions.map((action) => allActions[action]) as listItem[]
}
