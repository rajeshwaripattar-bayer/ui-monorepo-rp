import { IconProps } from '@element/react-icon'
import { ButtonProps } from '@element/react-button'
import { AlertProps, MessageWithActionProps } from '@gc/components'

export type Notification = {
  open: boolean
  timeout?: number
  message: string
  dismissButtonLabel?: string
  actionButtonProps?: {
    label: string
    onAction: () => void
  }
}

export type ContingencyProps = {
  code: string
  displayType: 'dialog' | 'alert' | 'messageWithAction' | 'loadingModal' | 'custom'
  displayDefault?: boolean
  onDismissAction?: () => void
  defaultMessageProps?: {
    // variant?: string // default is WARNING //TODO Need to implement warning vs error state (if required by UX)
    onTryAgainAction: () => void
  }
  dialogProps?: {
    open: boolean
    title: string
    message: string
    dismissButtonLabel?: string
    actionButtonProps?: {
      label: string
      onAction: () => void
    }
  }
  alertProps?: AlertProps
  messageWithActionProps?: MessageWithActionProps
  loadingModalProps?: {
    label: string
    open: boolean
  }
}
