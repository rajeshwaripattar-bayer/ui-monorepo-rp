import styles from './Snackbar.module.scss'
import { Snackbar as ElementSnackbar } from '@element/react-snackbar'
import { TypoSubtitle } from '@element/react-typography'
import { Notification } from '@gc/components/types'
import { useSelector } from 'react-redux'
import { useScreenRes } from '@gc/hooks'
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import { resolutions } from '@gc/constants'

export interface NotificationSnackBarProps {
  timeout?: number
  handleClose: () => void
  notification?: Notification | undefined
  dispatch?: ThunkDispatch<object, undefined, UnknownAction>
}

export function Snackbar<RootState extends { app: { notification?: Notification } }>(props: NotificationSnackBarProps) {
  const { handleClose } = props
  const notificationInStore = useSelector((state: RootState) => state.app.notification)
  const notification = props.notification || notificationInStore
  const res = useScreenRes()
  const isMobile = res <= resolutions.M839
  const snackbarStyle = isMobile ? styles.snackbarMobile : styles.snackbar
  return (
    <>
      {notification?.actionButtonProps && (
        <ElementSnackbar
          className={snackbarStyle}
          open={notification.open}
          timeout={props.timeout || notification.timeout || 4000}
          dismissLabel={notification.dismissButtonLabel ?? ''}
          actionLabel={notification.actionButtonProps.label}
          onClick={notification.actionButtonProps.onAction}
          onClose={handleClose}
        >
          <TypoSubtitle level={2}>{notification.message}</TypoSubtitle>
        </ElementSnackbar>
      )}
      {notification && !notification.actionButtonProps && (
        <ElementSnackbar
          className={snackbarStyle}
          open={notification.open}
          timeout={props.timeout || notification.timeout || 4000}
          dismissLabel={notification.dismissButtonLabel ?? ''}
          onClose={handleClose}
        >
          <TypoSubtitle level={2}>{notification.message}</TypoSubtitle>
        </ElementSnackbar>
      )}
    </>
  )
}

export default Snackbar
