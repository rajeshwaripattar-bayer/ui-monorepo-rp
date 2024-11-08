import { Button } from '@element/react-button'
import { Card, CardActions, CardBody, CardContent, CardDivider, CardTitle } from '@element/react-card'
import { CircularProgress } from '@element/react-circular-progress'
import { Icon } from '@element/react-icon'
import { IconButton } from '@element/react-icon-button'
import { TypoBody } from '@element/react-typography'
import { FlagLabel } from '@gc/components'
import React, { useState } from 'react'

import styles from './FarmerWidget.module.scss'
import TableMessage from './TableMessage'

type FarmerWidgetProps = {
  title?: string
  infoText?: string
  actionButtonText?: string
  actionButtonRedirectLink?: string
  loading?: boolean
  showFlagLabel?: boolean
  isError?: boolean
  noData?: boolean
  noTitleColor?: boolean
  children: React.ReactNode
  refetch?: () => void
}

export const FarmerWidget = (props: FarmerWidgetProps) => {
  const {
    title = '',
    infoText = '',
    actionButtonText = 'VIEW DATA',
    actionButtonRedirectLink = '',
    loading = false,
    showFlagLabel = false,
    isError = false,
    noData = false,
    noTitleColor = false,
    children,
    refetch = () => {}
  } = props
  const [showInfo, setShowInfo] = useState(false)
  const handleClickActionButton = () => {
    window.location.href = actionButtonRedirectLink
  }

  const renderCardBody = () => {
    if (showInfo)
      return (
        <div className={styles.infoSection}>
          <Icon icon='info' iconSize='medium' />
          <TypoBody level={2} style={{ marginTop: 5 }}>
            {infoText}
          </TypoBody>
        </div>
      )
    if (isError || noData) {
      return <TableMessage loading={false} error={isError} refetch={refetch} />
    }
    if (loading) return <CircularProgress />
    return <div style={{ width: '100%' }}>{children}</div>
  }
  const cardBodyStyle = showInfo || loading ? styles.infoBody : styles.cardBody
  const infoIcon = showInfo ? 'close' : 'info'

  return (
    <Card className={styles.farmerWidgetContainer}>
      <CardContent>
        <CardTitle
          primaryText={title}
          themeColor={noTitleColor ? 'surface' : 'primary'}
          trailingBlockType={showFlagLabel || infoText ? 'avatar' : undefined}
          trailingBlock={
            <>
              {showFlagLabel && <FlagLabel />}
              {infoText && <IconButton iconSize='small' onClick={() => setShowInfo(!showInfo)} icon={infoIcon} />}
            </>
          }
        />
        <CardDivider />
        <CardBody className={cardBodyStyle}>{renderCardBody()}</CardBody>
        {!showInfo && !loading && (
          <CardActions
            alignment='trailing'
            actionButtons={
              <Button
                trailingIcon='arrow_forward_ios'
                variant='text'
                label={actionButtonText}
                onClick={handleClickActionButton}
              />
            }
          />
        )}
      </CardContent>
    </Card>
  )
}

export default FarmerWidget
