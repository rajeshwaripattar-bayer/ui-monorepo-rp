// import styles from './ConfirmationModal.module.scss'
import { Modal } from '@element/react-modal'
import { Button } from '@element/react-button'
import { TypoSubtitle } from '@element/react-typography'

/* eslint-disable-next-line */
export interface ConfirmationModalProps {
  open: boolean
  modalSize?: string
  title: string
  message: string
  primaryButtonProps: {
    text: string
    variant?: string
    themeColor?: string
  }
  dismissiveButtonProps?: {
    text: string
    variant?: string
    themeColor?: string
  }
  handleClose: () => void
  onConfirmation: () => void
}

export function ConfirmationModal(props: ConfirmationModalProps) {
  return (
    <Modal
      open={props.open}
      preventClose
      title={props.title}
      modalSize={props.modalSize || 'medium'}
      onClose={props.handleClose}
      dismissiveButton={
        props.dismissiveButtonProps && (
          <Button
            variant={props.dismissiveButtonProps.variant ?? 'text'}
            themeColor={props.dismissiveButtonProps.themeColor ?? 'primary'}
            data-testid='dismissiveButton'
          >
            {props.dismissiveButtonProps.text}
          </Button>
        )
      }
      primaryButton={
        <Button
          variant={props.primaryButtonProps.variant ?? 'text'}
          themeColor={props.primaryButtonProps.themeColor ?? 'danger'}
          onClick={props.onConfirmation}
          data-testid='primaryButton'
        >
          {props.primaryButtonProps.text}
        </Button>
      }
    >
      <div>
        <TypoSubtitle level={2} data-testid='messageText'>
          {props.message}
        </TypoSubtitle>
      </div>
    </Modal>
  )
}

export default ConfirmationModal
