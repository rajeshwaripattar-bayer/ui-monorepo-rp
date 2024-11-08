export interface Notification {
  open: boolean
  timeout?: number
  message: string
  dismissButtonLabel?: string
  actionButtonProps?: {
    label: string
    onAction: () => void
  }
}
