import { Button } from '@element/react-button'
import { CircularProgress } from '@element/react-circular-progress'
import { Divider } from '@element/react-divider'
import { Grid, GridCol, GridRow } from '@element/react-grid'
import { Icon } from '@element/react-icon'
import { Modal } from '@element/react-modal'
import { Radio } from '@element/react-radio'
import { Textfield } from '@element/react-textfield'
import { Tooltip } from '@element/react-tooltip'
import { TypoCaption, TypoDisplay } from '@element/react-typography'
import { FarmerDetails, FvGrowerAccount, StatusIndicator } from '@gc/types'
import { fuzzySearch } from '@gc/utils'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useLazyGetDealerAssociatedGrowerFvAccountsQuery } from '../store'
import styles from './LinkFieldViewModal.module.scss'
import PendingErrorAckIndicator from './PendingErrorAckIndicator'

type LinkFieldViewModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  farmerDetails: FarmerDetails
  actionDetails: StatusIndicator
  linkFieldView: (selectedFvAccountDetails: FvGrowerAccount | undefined) => void
  linkedAccounts: FvGrowerAccount[] | []
}

export const LinkFieldViewModal = (props: LinkFieldViewModalProps) => {
  const { open, setOpen, linkFieldView, actionDetails, linkedAccounts } = props
  const [isFvAccountsLoading, setLoading] = useState(false)
  const [fvAccounts, setFvAccounts] = useState<FvGrowerAccount[]>([])
  const [searchText, setSearchText] = useState<string>('')
  const [selectedFvAccount, setSelectedFvAccount] = useState<string | null>(null)
  const [getDealerAssociations] = useLazyGetDealerAssociatedGrowerFvAccountsQuery()
  const searchedFvAccounts = useMemo(() => {
    if (!searchText) {
      return fvAccounts
    } else {
      const searchResult = fuzzySearch(searchText, fvAccounts, ['fieldViewName', 'fieldViewEmail'])
      return searchResult
    }
  }, [searchText, fvAccounts])
  const { t } = useTranslation()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getDealerAssociations()
      .then((res) => {
        setLoading(false)
        setFvAccounts(res?.data || [])
      })
      .catch((err) => {
        setLoading(false)
        setFvAccounts([])
        console.error(err)
      })
  }, [open])

  useEffect(() => {
    if (actionDetails.isSuccess) setTimeout(() => setOpen(false), 2000)
  }, [actionDetails])

  const modalTitle = t('farmers.farmerDetails.fieldView.link.modalTitle')

  const handleOnClickNotAgree = () => {
    setOpen(false)
  }

  const handleOnClickProceed = () => {
    const selectedFvAccountDetails = fvAccounts.find((account) => account.fieldViewId === selectedFvAccount)
    linkFieldView(selectedFvAccountDetails)
  }

  const LoadingBlock = () => {
    return (
      <div style={{ height: 100 }}>
        <p>Please wait while we fetch fieldview accounts...</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </div>
      </div>
    )
  }

  const ModalBodyBlock = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <Divider />
            <Textfield
              variant='embedded'
              label='Search'
              value={searchText}
              onChange={handleSearchChange}
              fullWidth={true}
              dense
              autoFocus
              leadingIcon={<Icon icon='search' />}
            />
          </div>
          <div style={{ maxHeight: 320 }}>
            <Grid style={{ marginBottom: '22px !important' }}>
              <GridRow style={{ margin: 8, justifyContent: 'center', alignItems: 'center' }}>
                <GridCol desktopCol={4}>
                  <TypoDisplay level={6}>Account Name</TypoDisplay>
                </GridCol>
                <GridCol desktopCol={6}>
                  <TypoDisplay level={6}>Email</TypoDisplay>
                </GridCol>
                <GridCol desktopCol={2}>
                  <TypoDisplay level={6}>Action</TypoDisplay>
                </GridCol>
              </GridRow>
              <Divider />
              {searchedFvAccounts.map((account, index) => {
                const disabledRow = linkedAccounts.some((linkedAccount) => linkedAccount.fieldViewId === account.fieldViewId)
                const rowStyle = {
                  margin: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: disabledRow ? '#f0f0f0' : 'transparent',
                  cursor: disabledRow ? 'not-allowed' : 'pointer',
                  opacity: disabledRow ? 0.6 : 1
                }
                const toolTipText = disabledRow ? 'Already linked to a different grower' : ''
                return (
                  <Tooltip containerType={'block'} text={toolTipText}>
                    <Fragment key={index}>
                      <GridRow style={rowStyle}>
                        <GridCol desktopCol={4}>
                          <TypoCaption>{account.fieldViewName}</TypoCaption>
                        </GridCol>
                        <GridCol desktopCol={6}>
                          <TypoCaption>{account.fieldViewEmail}</TypoCaption>
                        </GridCol>
                        <GridCol desktopCol={2}>
                          {disabledRow ? 'linked' : <Radio
                            value={account.fieldViewId}
                            hideLabel={true}
                            label={account.fieldViewId}
                            name='radio-group'
                            disabled={disabledRow}
                            checked={selectedFvAccount === account.fieldViewId}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              setSelectedFvAccount(event.target.value)
                            }
                          />}
                        </GridCol>
                      </GridRow>
                      <Divider />
                    </Fragment>
                  </Tooltip>
                )
              })}
              {searchedFvAccounts.length === 0 && (
                <GridRow>
                  <GridCol desktopCol={12} style={{ margin: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <TypoDisplay level={7}>No accounts found</TypoDisplay>
                  </GridCol>
                </GridRow>
              )}
            </Grid>
            <Divider />
          </div>
        </div>
        <div style={{ position: 'sticky', bottom: 0, backgroundColor: 'white' }}>
          <PendingErrorAckIndicator
            isLoading={actionDetails.isLoading}
            loadingMsg={t('farmers.farmerDetails.fieldView.link.pendingMsg')}
            isError={actionDetails.isError}
            isSuccess={actionDetails.isSuccess}
            successMsg={t('farmers.farmerDetails.fieldView.link.successMsg')}
            errMsg={t('farmers.farmerDetails.fieldView.link.errorMsg')}
          />
        </div>
      </div>
    )
  }

  return (
    <Modal
      className={styles.fieldViewModalContainer}
      title={modalTitle}
      modalSize='large'
      open={open}
      onClose={() => {
        setOpen(false)
        setSearchText('')
      }}
      dismissiveButton={
        <Button variant='text' onClick={handleOnClickNotAgree}>
          cancel
        </Button>
      }
      actionButton={
        <Button
          onClick={handleOnClickProceed}
          disabled={searchedFvAccounts.length === 0 || !selectedFvAccount || actionDetails.isSuccess}
        >
          PROCEED
        </Button>
      }
      content={isFvAccountsLoading ? <LoadingBlock /> : <ModalBodyBlock />}
      footerSupplemental={
        <TypoCaption
          style={{ color: '#74CCFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
        >
          <Icon icon='info' iconSize='small' />
          {t('farmers.farmerDetails.fieldView.link.modalHelperText')}
        </TypoCaption>
      }
    />
  )
}

export default LinkFieldViewModal
