import { Button } from '@element/react-button'
import { CircularProgress } from '@element/react-circular-progress'
import { Divider } from '@element/react-divider'
import { Icon } from '@element/react-icon'
import { Modal } from '@element/react-modal'
import { TypoBody, TypoDisplay } from '@element/react-typography'
import { useAppSessionData, useFarmersModuleConfig, useScreenRes } from '@gc/hooks'
import { Offer } from '@gc/types'
import { getFasteStoreKey } from '@gc/utils'
import DOMPurify from 'dompurify'
import _ from 'lodash'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useGetTextBlockFromAemQuery, usePostFvGrowerNominationMutation } from '../store'
import styles from './NominationModal.module.scss'

type NominationModalProps = {
  offer?: Offer
  open: boolean
  setOpen: (a: boolean) => void
}

export const NominationModal = ({ offer, open, setOpen }: NominationModalProps) => {
  const { aemPathMapper, nbmProgramUrls } = useFarmersModuleConfig()
  const screenResolution: number = useScreenRes()
  const isDesktopResolution = screenResolution > 3
  const navigate = useNavigate()
  const programName = offer?.name ?? ''
  const textPath = aemPathMapper[programName]
  const urlProgramName = _.kebabCase(programName) || 'unknown'
  const {
    data: textBlock,
    isLoading: isTextLoading,
    isFetching: isTextFetching,
    isError: isTextError,
    refetch: refetchAemTextBlock
  } = useGetTextBlockFromAemQuery({ path: textPath }, { skip: !textPath })
  const appSessionData = useAppSessionData()
  const appSessionKey = getFasteStoreKey('farmers', 'farmerInfo')
  const sessionData = _.get(appSessionData, appSessionKey)
  const modalTitle = `Get Started with ${programName}`

  const handleOnClickNotAgree = () => {
    setOpen(false)
    resetState()
  }
  const { t } = useTranslation()
  const sanitizedText = DOMPurify.sanitize(textBlock?.text || '')
  const [
    postNomination,
    { isLoading: isNominateLoading, isError: isNominateError, isSuccess: isNominationSuccess, reset: resetState }
  ] = usePostFvGrowerNominationMutation()

  useEffect(() => {
    if (isNominationSuccess) {
      setTimeout(() => {
        navigateToProgramsPage()
      }, 500)
    }
  }, [isNominationSuccess])

  const handleOnClickProceed = () => {
    if (offer?.offerStatus === 'Available') {
      postNomination({
        fieldViewId: sessionData?.GrowerFieldViewDetails?.fieldViewId ?? '',
        fieldViewProgramInstanceId: offer.fieldViewProgram?.id
      })
    } else {
      navigateToProgramsPage()
    }
  }

  const navigateToProgramsPage = () => {
    const fieldViewId = sessionData?.GrowerFieldViewDetails?.fieldViewId
    navigate(`/programs/${urlProgramName}`, {
      state: { fieldViewId, offer }
    })
  }

  const ErrorBlock = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Icon icon='sync_problem' />
          <TypoDisplay level={6}>{t('global.errors.tryAgainMessage')}</TypoDisplay>
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <TypoBody level={2}>Something went wrong while fetching the details</TypoBody>
          <Button onClick={refetchAemTextBlock} themeColor='secondary'>
            {t('global.errors.tryAgain')}
          </Button>
        </span>
      </div>
    )
  }

  const LoadingBlock = () => {
    return (
      <div style={{ height: 100 }}>
        <p>Please wait while we fetch the details...</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </div>
      </div>
    )
  }

  const NominationAcknowledgementBlock = () => {
    const parentBackgroundColor = isNominateLoading ? '#C2E0FF' : isNominationSuccess ? '#B8F2C7' : '#FFD6D6'
    const childClassName = 'color-section__caption color-caption mdc-typography--caption'
    const showBlock = isNominateLoading || isNominateError || isNominationSuccess
    const blockText = isNominateLoading
      ? 'Submitting your nomination, please wait...'
      : isNominationSuccess
      ? 'Successfully submitted your nomination. Please wait while we redirect to enrollement page...'
      : 'Error submitting nomination. Please try again.'
    const icon = isNominateLoading ? 'replay' : isNominationSuccess ? 'done' : 'error_outline'
    return (
      showBlock && (
        <div
          style={{
            backgroundColor: parentBackgroundColor,
            padding: '5px 5px 5px 10px',
            borderRadius: '2px',
            maxHeight: 32,
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

  const ModalBodyBlock = () => {
    const programReviewUrl = nbmProgramUrls[programName]
    return (
      <span>
        <div dangerouslySetInnerHTML={{ __html: sanitizedText }} />
        <Divider />
        <NominationAcknowledgementBlock />
        {isTextLoading || isTextError || isNominationSuccess ? null : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <a href={programReviewUrl} target='_blank' rel='noopener noreferrer'>
              {t('farmers.farmerDetails.offers.programReviewUrl')}
            </a>
            <div style={{ display: 'flex', gap: 10 }}>
              {isDesktopResolution && (
                <Button variant='text' onClick={handleOnClickNotAgree}>
                  CANCEL
                </Button>
              )}
              <Button onClick={handleOnClickProceed} disabled={isNominateLoading || isNominationSuccess}>
                PROCEED
              </Button>
            </div>
          </div>
        )}
      </span>
    )
  }

  return (
    <Modal
      className={styles.nominationConainer}
      title={modalTitle}
      modalSize='large'
      open={open}
      onClose={() => {
        setOpen(false)
        resetState()
      }}
    >
      {isTextError ? <ErrorBlock /> : isTextLoading || isTextFetching ? <LoadingBlock /> : <ModalBodyBlock />}
    </Modal>
  )
}

export default NominationModal
