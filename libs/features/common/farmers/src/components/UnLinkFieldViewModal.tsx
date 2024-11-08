import { Button } from '@element/react-button'
import { Divider } from '@element/react-divider'
import { Modal } from '@element/react-modal'
import { StatusIndicator } from '@gc/types'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import PendingErrorAckIndicator from './PendingErrorAckIndicator'

type UnLinkFieldViewModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  unLinkFieldView: () => void
  actionDetails: StatusIndicator
}

export const UnLinkFieldViewModal = (props: UnLinkFieldViewModalProps) => {
  const { open, setOpen, unLinkFieldView, actionDetails } = props
  const { t } = useTranslation()

  const modalTitle = t('farmers.farmerDetails.fieldView.unlink.modalTitle')

  useEffect(() => {
    if (actionDetails.isSuccess) {
      setTimeout(() => setOpen(false), 2000)
    }
  }, [actionDetails])

  const handleOnClickNotAgree = () => {
    setOpen(false)
  }

  const handleOnClickProceed = () => {
    unLinkFieldView()
  }

  const ModalBodyBlock = () => {
    return (
      <span>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h4>
            {t('farmers.farmerDetails.fieldView.unlink.line1')}
            <br />
            <span style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {t('farmers.farmerDetails.fieldView.unlink.line2')}
            </span>
          </h4>
        </div>
        <div>
          <PendingErrorAckIndicator
            isLoading={actionDetails.isLoading}
            loadingMsg={t('farmers.farmerDetails.fieldView.unlink.pendingMsg')}
            isError={actionDetails.isError}
            isSuccess={actionDetails.isSuccess}
            successMsg={t('farmers.farmerDetails.fieldView.unlink.successMsg')}
            errMsg={t('farmers.farmerDetails.fieldView.unlink.errorMsg')}
          />
        </div>
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant='text' onClick={handleOnClickNotAgree}>
              CANCEL
            </Button>
            <Button
              onClick={handleOnClickProceed}
              variant='danger'
              disabled={actionDetails.isLoading || actionDetails.isSuccess}
            >
              YES, UNLINK
            </Button>
          </div>
        </div>
      </span>
    )
  }

  return (
    <Modal
      title={modalTitle}
      modalSize='large'
      open={open}
      onClose={() => {
        setOpen(false)
      }}
    >
      <ModalBodyBlock />
    </Modal>
  )
}

export default UnLinkFieldViewModal
