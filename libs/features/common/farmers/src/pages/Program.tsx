import { Button } from '@element/react-button'
import { Grid, GridCol, GridRow } from '@element/react-grid'
import { TypoDisplay } from '@element/react-typography'
import { useFarmersModuleConfig } from '@gc/hooks'
import { Offer } from '@gc/types'
import camelCase from 'lodash/camelCase'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { BackButton, PendingErrorAckIndicator } from '../components'
import styles from './Program.module.scss'

const FieldsEnrollmentStep = React.lazy(() => import('eligibilityEnrollmentLibrary/FieldsEnrollmentStep'))

export const Program = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { nbmProgramUrls } = useFarmersModuleConfig()
  const { fieldViewId, offer } = location.state as { fieldViewId: string; offer: Offer }

  const handleProgramReviewDetailsClick = () => {
    const programName = offer?.name ?? ''
    const programReviewUrl = nbmProgramUrls[programName]
    const newTab = window.open(programReviewUrl, '_blank')
    if (newTab) {
      newTab.opener = null // Prevents potential security risks
    }
  }

  return (
    <Grid className={styles.myFarmersContainer}>
      <GridRow className={styles.headerRow}>
        <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
          <BackButton />
        </GridCol>
      </GridRow>
      <GridRow className={styles.pageActionRow}>
        <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
          <TypoDisplay level={3}>{offer?.name?.toUpperCase() || 'UNKNOWN'}</TypoDisplay>
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol desktopCol={12} tabletCol={8} phoneCol={4} rowSpan={3} className={styles.subtitle}>
          <TypoDisplay level={6}>{`${t('farmers.programEnrollment.programTitle')} ${offer?.name}`}</TypoDisplay>
        </GridCol>
      </GridRow>
      <GridRow className={styles.content}>
        <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
          <TypoDisplay level={8}>{t(`farmers.programEnrollment.${camelCase(offer?.name)}Desc`)}</TypoDisplay>
        </GridCol>
      </GridRow>
      <GridRow className={styles.programReview}>
        <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
          <Button
            className={styles.noPaddingButton}
            variant='text'
            onClick={handleProgramReviewDetailsClick}
            label={t('farmers.programDetails.programReviewLabel')}
          />
        </GridCol>
      </GridRow>
      <GridRow className={styles.content}>
        <GridCol desktopCol={12} tabletCol={12} phoneCol={12}>
          <ErrorBoundary
            fallback={
              <div style={{ marginTop: 40, width: '100%' }}>
                <PendingErrorAckIndicator
                  isLoading={false}
                  isError={true}
                  isSuccess={false}
                  errMsg={"We're having trouble getting fields at this time. Please check back later."}
                />
              </div>
            }
          >
            <Suspense>
              <FieldsEnrollmentStep growerId={fieldViewId} programInstance={offer?.fieldViewProgram} />
            </Suspense>
          </ErrorBoundary>
        </GridCol>
      </GridRow>
    </Grid>
  )
}

export default Program
