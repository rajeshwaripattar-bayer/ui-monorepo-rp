import { Icon } from '@element/react-icon'
import React from 'react'

type PendingErrorAckIndicatorProps = {
  isLoading: boolean
  loadingMsg?: string
  isError: boolean
  errMsg?: string
  isSuccess: boolean
  successMsg?: string
}

export const PendingErrorAckIndicator = (props: PendingErrorAckIndicatorProps) => {
  const {
    isLoading,
    isError,
    isSuccess,
    loadingMsg = 'please wait while processing..',
    errMsg = 'something went wrong. please try again',
    successMsg = 'successfully processed the request'
  } = props
  const parentBackgroundColor = isLoading ? '#C2E0FF' : isError ? '#FFD6D6' : '#B8F2C7'
  const childClassName = 'color-section__caption color-caption mdc-typography--caption'
  const showBlock = !(!isLoading && !isError && !isSuccess)
  const blockText = isLoading ? loadingMsg : isError ? errMsg : successMsg
  const icon = isLoading ? 'replay' : isError ? 'error_outline' : 'done'
  return (
    showBlock && (
      <div
        style={{
          backgroundColor: parentBackgroundColor,
          padding: '5px 5px 5px 10px',
          borderRadius: '2px',
          maxHeight: 32,
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <span>
          <Icon icon={icon} style={{ marginTop: 6, fontSize: 16 }} />
        </span>
        <span>
          <p className={childClassName}>{blockText}</p>
        </span>
      </div>
    )
  )
}

export default PendingErrorAckIndicator
