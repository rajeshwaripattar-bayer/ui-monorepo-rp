import { Quote, QuoteDetails, QuoteActionType } from '@gc/types'
import { useTranslation } from 'react-i18next'
import { useScreenRes } from './useScreenRes'
import { resolutions } from '@gc/constants'
import { Dispatch, SetStateAction } from 'react'
import { useQuotesQueries } from '@gc/redux-store'
import { fasteRoute } from '@gc/utils'
import { useLocation, useNavigate } from 'react-router-dom'
import { setContingency, setNotification } from '@gc/redux-store'
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import { saveAs } from 'file-saver'

type modalProps = {
  open: boolean
  title: string
  primaryButtonProps: { text: string }
  dismissiveButtonProps: { text: string }
  message: string
  onConfirmation: () => void
}
type listItem = { value: string; label: string; onClick: () => void }

export const useQuoteActions = (
  actions: QuoteActionType[],
  setModelProps?: Dispatch<SetStateAction<modalProps>>,
  dispatch?: ThunkDispatch<object, undefined, UnknownAction>
): { value: string; label: string; onClick: () => void }[] => {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const { useUpdateQuoteMutation, useQuotePDFMutation, useDuplicateQuoteMutation } = useQuotesQueries()
  const [updateQuote] = useUpdateQuoteMutation()
  const [initEditQuote, { retry: retryInitEdit, cancel: cancelEdit }] = useUpdateQuoteMutation()
  const [quotePDF] = useQuotePDFMutation()
  const [duplicateQuote, { retry: retryDuplicateQuote, cancel: cancelDuplicate }] = useDuplicateQuoteMutation()
  const res = useScreenRes()

  const handleEdit = async (quote: Quote | QuoteDetails) => {
    const res = (await initEditQuote(
      {
        quoteId: quote.code || '',
        reqBody: { action: 'EDIT' }
      },
      {
        dispatch,
        contingency: {
          code: 'EDIT_QUOTE_FAILED',
          displayType: 'dialog',
          onDismissAction: cancelEdit,
          dialogProps: {
            title: t('quotes.edit_failed.label'),
            message: t('common.refresh_page_to_fix.description'),
            open: true,
            actionButtonProps: {
              label: t('common.try_again.label'),
              onAction: retryInitEdit
            }
          }
        }
      }
    )) as { data: Quote | undefined }
    if (res.data) {
      fasteRoute(`/quotes/${quote.code}`, {
        cartId: res.data.cartId,
        inEditMode: true
      })
    }
  }

  const handleDuplicate = async (quote: Quote | QuoteDetails) => {
    const res = await duplicateQuote(quote.code || '', {
      dispatch,
      contingency: {
        code: 'DUPLICATE_QUOTE_FAILED',
        displayType: 'dialog',
        onDismissAction: cancelDuplicate,
        dialogProps: {
          title: t('quotes.duplicate_failed.label'),
          message: t('common.refresh_page_to_fix.description'),
          open: true,
          actionButtonProps: {
            label: t('common.try_again.label'),
            onAction: retryDuplicateQuote
          }
        }
      }
    })
    if (res.data) {
      fasteRoute(`/quotes/${res.data.code}`, { inReviewMode: true, quoteCode: res.data.code })
    }
  }

  const handleConvertToOrder = (quote: Quote | QuoteDetails) => {
    console.log('Convert to Order was clicked', quote)
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

  const errorPrintQuote = (quote: Quote) => {
    dispatch?.(
      setContingency({
        code: 'PRINT_QUOTE_FAILED',
        displayType: 'dialog',
        onDismissAction: dismissPrintQuote,
        dialogProps: {
          title: t('quotes.print_quote.error_msg.label'),
          message: t('common.refresh_page_to_fix.description'),
          open: true,
          actionButtonProps: {
            label: t('common.try_again.label'),
            onAction: () => handlePrint(quote)
          }
        }
      })
    )
  }

  const loadingPrintQuote = () => {
     dispatch?.(
      setContingency({
        code: 'LOADING_PRINT',
        displayType: 'loadingModal',
        loadingModalProps: {
          label: t('quotes.print_quote.loading_msg.label'),
          open: true
        }
      })
    )
  }

  const dismissPrintQuote = () => {
    dispatch?.(setContingency())
  }

  const handlePrint = async (quote: Quote) => {
    const quoteId = quote?.salesQuoteNumber
    if (quoteId) {
      try {
        loadingPrintQuote()
        const res = await quotePDF(quoteId).unwrap()
        dismissPrintQuote()
        if (res?.strSQPrintPdfBody) {
          const url = 'data:application/pdf;base64,' + res?.strSQPrintPdfBody
          saveAs(url, `quote-${quote.code}.pdf`)
        }
      } catch (error) {
        errorPrintQuote(quote)
      }
    } else {
      errorPrintQuote(quote)
    }
  }

  const handleDeleteConfirmation = async (quoteId: string) => {
    try {
      await updateQuote({
        quoteId: quoteId,
        reqBody: { action: 'CANCEL' },
        isMobile: res <= resolutions.M1023
      })
      if (pathname === `/${quoteId}`) {
        navigate(-1)
      }
      dispatch?.(
        setNotification({
          open: true,
          message: `${quoteId} ${t('quotes.quote_delete_successful.label')}`
        })
      )
    } catch (error) {
      setModelProps &&
        setModelProps({
          open: true,
          title: t('quotes.delete_quote.label'),
          primaryButtonProps: { text: t('common.try_again.label') },
          dismissiveButtonProps: { text: t('common.dismiss.label') },
          message: t('quotes.delete_quote_tryagain.label'),
          onConfirmation: () => handleDeleteConfirmation(quoteId)
        })
    }
  }

  const handleDelete = (quote: Quote | QuoteDetails) => {
    setModelProps &&
      setModelProps({
        open: true,
        title: t('quotes.delete_quote.label'),
        primaryButtonProps: { text: t('common.confirm.label') },
        dismissiveButtonProps: { text: t('common.cancel.label') },
        message: `${t('quotes.delete_quote_confirmation.label')} ${quote.code}? ${t(
          'common.action_cannot_undone.label'
        )}`,
        onConfirmation: () => handleDeleteConfirmation(quote.code)
      })
  }

  const allActions = {
    edit: { value: 'edit', label: t('common.edit.label'), onClick: handleEdit },
    duplicate: { value: 'duplicate', label: t('common.duplicate.label'), onClick: handleDuplicate },
    convertToOrder: {
      value: 'convertToOrder',
      label: t('quotes.convert_to_order.label'),
      onClick: handleConvertToOrder
    },
    shareWithFarmer: {
      value: 'shareWithFarmer',
      label: t('quotes.share_with_farmer.label'),
      onClick: handleShareWithFarmer
    },
    print: { value: 'print', label: t('common.print.label'), onClick: handlePrint },
    delete: { value: 'delete', label: t('common.delete.label'), onClick: handleDelete },
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
