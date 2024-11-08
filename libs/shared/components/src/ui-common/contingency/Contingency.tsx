import styles from './Contingency.module.scss'
import { Dialog, DialogButton } from '@element/react-dialog'
import { TypoBody, TypoDisplay } from '@element/react-typography'
import { ContingencyProps } from '@gc/types'
import Alert, { AlertProps } from '../alert/Alert'
import MessageWithAction, { MessageWithActionProps } from '../message-with-action/MessageWithAction'
import { useTranslation } from 'react-i18next'
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import { setContingency } from '@gc/redux-store'
import _ from 'lodash'
import { Modal } from '@element/react-modal'
import Loading from '../loading/Loading'

export interface Props<RootState> {
  codes: string[]
  className?: string
  types: ContingencyProps['displayType'][]
  contingency?: ContingencyProps
  onDismissAction?: () => void
  rootState?: RootState
  dispatch?: ThunkDispatch<object, undefined, UnknownAction>
}

export function Contingency<RootState extends { app: { contingency?: ContingencyProps } }>(props: Props<RootState>) {
  const { t } = useTranslation()
  const { types, codes, dispatch } = props
  const contingencyInStore = useSelector((state: RootState) => state.app.contingency)
  const contingency = props.contingency || contingencyInStore
  // Based on the type of contingency and where component is being used, we need to decide whether a it needs return Contingency JSX!!
  if (
    !contingency ||
    !types.includes(contingency.displayType) ||
    !_.intersection(codes, [contingency.code, 'ALL']).length
  ) {
    return null
  }

  const {
    displayType,
    dialogProps,
    displayDefault,
    defaultMessageProps,
    messageWithActionProps,
    alertProps,
    loadingModalProps,
    onDismissAction
  } = contingency

  const defaultMessageWithAction: MessageWithActionProps = {
    messageHeader: 'We’ve lost the connection.',
    messageDescription: 'Reloading the screen may fix the problem.',
    iconProps: {
      icon: 'warning',
      variant: 'filled-secondary',
      className: 'lmnt-utility-orange',
      style: { color: '#9E6400', backgroundColor: '#FFE494' }
    },
    primaryButtonProps: {
      label: t('common.try_again.label'),
      variant: 'text',
      themeColor: 'primary',
      onClick: defaultMessageProps?.onTryAgainAction
    }
  }

  const defaultAlert: AlertProps = {
    type: 'warning',
    variant: 'tonal',
    title: 'We’ve lost the connection.',
    description: 'Reloading the screen may fix the problem.',
    actionButtonProps: {
      label: t('common.try_again.label'),
      onClick: defaultMessageProps?.onTryAgainAction
    }
  }

  const defaultDialog = {
    open: true,
    title: 'We’ve lost the connection.',
    message: 'Reloading the screen may fix the problem.',
    actionButtonProps: {
      label: t('common.try_again.label'),
      onAction: defaultMessageProps?.onTryAgainAction
    }
  }

  const dialogActions = (
    <>
      <DialogButton action='cancel' variant='text' onClick={onDismissAction}>
        {dialogProps?.dismissButtonLabel || 'Dismiss'}
      </DialogButton>
      <DialogButton action='ok' variant='text'>
        {dialogProps?.actionButtonProps?.label || defaultDialog.actionButtonProps.label}
      </DialogButton>
    </>
  )

  if (displayType === 'dialog' && (displayDefault || dialogProps)) {
    return (
      <Dialog
        open={dialogProps?.open || defaultDialog.open || false}
        actions={dialogActions}
        header={<TypoDisplay level={6}>{dialogProps?.title || defaultDialog.title}</TypoDisplay>}
        onAction={({ action }: { action: string }) => {
          if (action === 'ok') {
            if (dialogProps) {
              dialogProps?.actionButtonProps?.onAction()
            } else {
              defaultDialog.actionButtonProps.onAction && defaultDialog.actionButtonProps.onAction()
            }
          }
        }}
        onClosed={() => {
          dispatch && dispatch(setContingency())
        }}
      >
        <TypoBody>{dialogProps?.message || defaultDialog.message}</TypoBody>
      </Dialog>
    )
  } else if (displayType === 'alert' && (displayDefault || alertProps)) {
    return <Alert className={props.className} {...(alertProps || defaultAlert)} />
  } else if (displayType === 'messageWithAction' && (displayDefault || messageWithActionProps)) {
    return <MessageWithAction className={props.className} {...(messageWithActionProps || defaultMessageWithAction)} />
  } else if (displayType === 'loadingModal') {
    return (
      <Modal id='loading-modal' modalSize='small' preventClose open={loadingModalProps?.open} noActions>
        <div className={styles.loading_modal_content}>
          <Loading label={loadingModalProps?.label} />
        </div>
      </Modal>
    )
  }

  return null
}

export default Contingency
