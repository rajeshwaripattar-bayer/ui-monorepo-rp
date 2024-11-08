import { Modal } from '@element/react-modal'
import _ from 'lodash'
import { type ReactNode, useState } from 'react'

type ModalProps = { headerActions: ReactNode; footerActions?: ReactNode }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TestModal(props: { modalBody: (props: any) => ReactNode; openModal?: () => void }) {
  const [modalProps, setModalProps] = useState<ModalProps | null>(null)

  return (
    <Modal
      open={true}
      hideCloseIcon
      preventClose
      initialFocus={'primary'}
      headerActions={modalProps?.headerActions}
      nextButton={modalProps?.footerActions}
    >
      {props.modalBody && (
        <props.modalBody
          setModalProps={(newProps: ModalProps) => {
            if (!_.isEqual(JSON.stringify(newProps), JSON.stringify(modalProps))) {
              setModalProps(newProps)
            }
          }}
          openModal={props.openModal}
        />
      )}
    </Modal>
  )
}

export default TestModal
