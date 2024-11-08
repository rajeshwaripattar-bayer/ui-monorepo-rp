import { Contingency, Loading, MessageWithAction, ModalTopBar } from '@gc/components'
import styles from './AbandonQuoteModal.module.scss'
import { useTranslation } from 'react-i18next'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import {
  setCartId,
  useDeleteCartMutation,
  useUpdateCartAttributesMutation,
  resetSaveInProgressEntry,
  clearBrandDiscount,
  discardAppliedAllCart,
  updateAppliedAllQuotes
} from '@gc/redux-store'
import { useConvertCartToQuote, useCurrentCart, useSaveQuote, useUpdateCartCache } from '../../hooks/useCurrentCart'
import { setInEditMode, setInReviewMode, setRedirectToFarmers } from '../../store/slices/quotesSlice'
import { useScreenRes, useSelectedAccount } from '@gc/hooks'
import { RootState, useAppDispatch } from '../../store'
import { useSelector } from 'react-redux'
import { getInEditMode, getInReviewMode, getRedirectToFarmers } from '../../store/selectors/quotesSelector'
import { resolutions } from '@gc/constants'
import { useNavigate } from 'react-router-dom'
import { useQuotesQueries } from '@gc/redux-store'
import { formatDateWithTimezoneOffset, fasteRoute } from '@gc/utils'
import { setContingency } from '@gc/redux-store'
import type { ButtonProps } from '@element/react-button'
import _ from 'lodash'

/* eslint-disable-next-line */
export interface AbandonQuoteModalProps {
  setModalProps: (props: { headerActions?: ReactNode; footerActions?: ReactNode }) => void
  openModal: (a: string) => void
  quoteId?: string
}

export function AbandonQuoteModal(props: AbandonQuoteModalProps) {
  const { setModalProps, openModal, quoteId } = props
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const res = useScreenRes()

  const inReviewMode = useSelector(getInReviewMode)
  const inEditMode = useSelector(getInEditMode)
  const redirectToFarmers = useSelector(getRedirectToFarmers)
  const { useUpdateQuoteMutation } = useQuotesQueries()
  const [skipCartFetch, setSkipCartFetch] = useState(false)
  const { data, isLoading } = useCurrentCart({ skip: skipCartFetch })
  const [convertToQuote] = useConvertCartToQuote()
  const [deleteCart] = useDeleteCartMutation()
  const [updateQuote, { retry: retryUpdateQuote }] = useUpdateQuoteMutation()
  const [updateCartAttributes] = useUpdateCartAttributesMutation()
  const [saveQuote] = useSaveQuote()
  const [updateCartCache] = useUpdateCartCache()
  const [disabledActions, setDisabledActions] = useState(false)
  const sapAccountId = useSelectedAccount().sapAccountId
  const [cart, setCart] = useState(data)

  const entriesFound = useMemo(() => cart?.entries?.some((e) => !e.rejected), [cart])

  // This is to ensure we don't re render this component as a side effect of cart cleanup/delete.
  // In addition use of skipCartFetch will make sure no followup cart will be created in CC.
  useEffect(() => {
    if (!_.isEmpty(data)) {
      setCart(data)
    }
  }, [data])

  const exitModal = () => {
    props.openModal('EXIT')
    updateCartCache(() => ({}))
    dispatch(setCartId(undefined))
    dispatch(setInEditMode(false))
    dispatch(setInReviewMode(false))
    if (redirectToFarmers) {
      const primaryParty = cart?.billToParties.filter((p) => p.isPrimaryBillTo)
      if (primaryParty) {
        dispatch(setRedirectToFarmers(false))
        window.history.replaceState({ farmer: undefined }, '')
        fasteRoute(`/farmers/${primaryParty[0].sapAccountId}`)
      }
    } else if (inReviewMode) {
      navigate(-1)
    }
  }

  const handleCancelClick = useCallback(() => {
    dispatch(setContingency())
    openModal(inEditMode ? 'EXIT' : 'CREATE_QUOTE')
  }, [dispatch, inEditMode, openModal])

  const discardButtonProps: ButtonProps = {
    label: t('common.discard.label'),
    variant: 'text',
    themeColor: 'danger',
    disabled: disabledActions,
    onClick: async () => {
      let canExitModal = false
      dispatch(setContingency())
      dispatch(clearBrandDiscount())
      dispatch(discardAppliedAllCart())
      setSkipCartFetch(true)
      if (inReviewMode && quoteId) {
        const result = await updateQuote(
          {
            quoteId,
            reqBody: { action: 'CANCEL' },
            isMobile: res <= resolutions.M1023
          },
          {
            dispatch,
            contingency: {
              code: 'DISCARD_QUOTE_FAILED',
              displayType: 'alert',
              alertProps: {
                type: 'error',
                variant: 'tonal',
                title: t('quotes.discard_failed.label'),
                description: t('common.refresh_page_to_fix.description'),
                actionButtonProps: {
                  label: t('common.try_again.label'),
                  onClick: retryUpdateQuote
                }
              }
            }
          }
        )
        if (result.isSuccess) {
          canExitModal = true
        }
      } else {
        canExitModal = true
        dispatch(resetSaveInProgressEntry())
        deleteCart(cart?.code ?? '').unwrap()
      }
      if (canExitModal) {
        exitModal()
      }
    }
  }

  let messageHeader = 'quotes.discard_this_quote.label'
  let messageDescription = 'common.action_cannot_undone.label'
  let primaryButtonProps: ButtonProps = {
    label: t('common.cancel.label'),
    variant: 'text',
    themeColor: 'primary',
    disabled: disabledActions,
    onClick: handleCancelClick
  }
  let iconProps = {
    variant: 'filled-danger',
    icon: 'error_outline',
    className: 'lmnt-theme-danger-200-bg',
    style: { color: '#B3190D' }
  }
  let secondaryButtonProps = discardButtonProps

  if (cart?.entries && entriesFound) {
    messageHeader = 'quotes.save_this_quote.label'
    messageDescription = inEditMode
      ? 'quotes.update_quote.save_or_discard.description'
      : 'quotes.save_or_discard_quote.description'
    iconProps = {
      icon: 'save_alt',
      variant: 'filled-secondary',
      className: 'lmnt-theme-secondary-200-bg',
      style: { color: '#6E760B' }
    }
    secondaryButtonProps = {
      label: inEditMode ? t('common.save_changes.label') : t('common.save_as_draft.label'),
      variant: 'text',
      themeColor: 'primary',
      disabled: disabledActions,
      onClick: async () => {
        dispatch(setContingency())
        dispatch(updateAppliedAllQuotes())
        setDisabledActions(true)
        setSkipCartFetch(true)
        if (inReviewMode || inEditMode) {
          await saveQuote(quoteId, redirectToFarmers)
          exitModal()
        } else {
          await updateCartAttributes({
            cartId: cart?.code,
            attributes: {
              name: cart?.name,
              grower: cart.grower,
              cartType: 'QUOTE',
              agentSapId: sapAccountId, // Logged user's selected account sapId
              expirationDate: formatDateWithTimezoneOffset(cart.expirationDate),
              billToParties: cart?.billToParties
            }
          }).unwrap()
          convertToQuote({ cartId: cart?.code, skipQuotesRefetch: true }, { savingAsDraft: true })
          openModal('EXIT')
        }
      }
    }
    primaryButtonProps = discardButtonProps
  }

  useEffect(() => {
    setModalProps({
      headerActions: (
        <ModalTopBar
          title='Attention'
          exitIconButtonProps={{
            disabled: disabledActions,
            icon: inEditMode ? 'close' : 'arrow_back',
            onClick: handleCancelClick
          }}
        />
      )
    })
  }, [disabledActions, handleCancelClick, inEditMode, openModal, setModalProps])

  return isLoading ? (
    <div className={styles.loader}>
      <Loading label={t('cart.loading_cart_message.label')} />
    </div>
  ) : (
    <>
      <Contingency<RootState> codes={['DISCARD_QUOTE_FAILED']} types={['alert']} className={styles.alert_contingency} />
      <div className={styles.message_with_action_contingency}>
        <MessageWithAction
          messageHeader={t(messageHeader)}
          messageDescription={t(messageDescription)}
          iconProps={iconProps}
          primaryButtonProps={primaryButtonProps}
          secondaryButtonProps={secondaryButtonProps}
        />
      </div>
    </>
  )
}

export default AbandonQuoteModal
