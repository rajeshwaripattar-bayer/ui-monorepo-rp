import { Button } from '@element/react-button'
import { Icon } from '@element/react-icon'
import { TypoDisplay } from '@element/react-typography'
import { useAppSessionData, useSelectedAccount, useUpdateFasteStore } from '@gc/hooks'
import { FarmerDetails, FvGrowerAccount } from '@gc/types'
import { getFasteStoreKey } from '@gc/utils'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  useLazyLinkedFvAccountsQuery,
  useLazyLinkGrowerFvAccountQuery,
  useLazyUnlinkGrowerFvAccountQuery
} from '../store'
import FieldViewIcon from './FieldView'
import LinkFieldViewModal from './LinkFieldViewModal'
import UnLinkFieldViewModal from './UnLinkFieldViewModal'

type FieldViewLinkButtonProps = {
  farmerDetails: FarmerDetails
  refetchFarmerOffers: () => void
}

type LinkedGrowerResponse = {
  data: FvGrowerAccount[]
}

export function FieldViewLinkButton(props: FieldViewLinkButtonProps) {
  const { farmerDetails, refetchFarmerOffers } = props
  const { growerIrdId } = farmerDetails
  const [openLinkModal, setOpenLinkModal] = useState(false)
  const [openUnLinkModal, setOpenUnLinkModal] = useState(false)
  const [linkAction, setLinkAction] = useState({ isLoading: false, isError: false, isSuccess: false })
  const [unLinkAction, setUnLinkAction] = useState({ isLoading: false, isError: false, isSuccess: false })
  const [linkedGrowerAccs, setLinkedGrowerAccs] = useState<FvGrowerAccount[]>([])
  const selectedAccount = useSelectedAccount()
  const [getLinkedGrowerFvAccounts] = useLazyLinkedFvAccountsQuery()
  const [linkFvGrowerAccount] = useLazyLinkGrowerFvAccountQuery()
  const [unlinkFvGrowerAccount] = useLazyUnlinkGrowerFvAccountQuery()
  const [updateFaste] = useUpdateFasteStore()
  const appSessionData = useAppSessionData()
  const appSessionKey = getFasteStoreKey('farmers', 'farmerInfo')
  const sessionData = _.get(appSessionData, appSessionKey)
  const linkedGrowerFieldViewAccount = sessionData?.GrowerFieldViewDetails
  const { t } = useTranslation()

  useEffect(() => {
    const fetchLinkedGrowerAccounts = () => {
      getLinkedGrowerFvAccounts()
        .then((res) => {
          const linkedGrowerAccounts = (res as LinkedGrowerResponse)?.data || []
          setLinkedGrowerAccs(linkedGrowerAccounts)

          const account = linkedGrowerAccounts.find((account: FvGrowerAccount) => account.growerIrdId === growerIrdId)
          updateFaste('appSessionData', {
            [appSessionKey]: { ...sessionData, GrowerFieldViewDetails: account }
          })
        })
        .catch((err) => {
          console.error('Failed to fetch linked grower accounts', err)
        })
    }
    fetchLinkedGrowerAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [growerIrdId])

  useEffect(() => {
    // reset state upon close of modal
    if (!openLinkModal) setLinkAction({ isLoading: false, isError: false, isSuccess: false })
    if (!openUnLinkModal) setUnLinkAction({ isLoading: false, isError: false, isSuccess: false })
  }, [openLinkModal, openUnLinkModal])

  const getFieldViewLinkStatus = () => {
    const status = linkedGrowerFieldViewAccount ? 'linked' : 'unlinked'
    return status
  }

  const handleLinkFieldView = async (growerFvAccountToLink: FvGrowerAccount | undefined) => {
    setLinkAction({ isLoading: true, isError: false, isSuccess: false })
    const { isSuccess, error } = await linkFvGrowerAccount({
      dealerSapId: selectedAccount.sapAccountId,
      growerIrdId: farmerDetails?.growerIrdId || '',
      fieldViewId: growerFvAccountToLink?.fieldViewId || '',
      fieldViewEmail: growerFvAccountToLink?.fieldViewEmail || ''
    })
    if (isSuccess) {
      updateFaste('appSessionData', {
        [appSessionKey]: { ...sessionData, GrowerFieldViewDetails: growerFvAccountToLink }
      })
      refetchFarmerOffers()
      setLinkAction({ isLoading: false, isError: false, isSuccess: true })
      console.log('Linked FieldView Account')
    } else {
      console.error('Failed to link FieldView Account:', error)
      setLinkAction({ isLoading: false, isError: true, isSuccess: false })
    }
  }

  const handleUnLinkFieldView = async () => {
    setUnLinkAction({ isLoading: true, isError: false, isSuccess: false })
    const { isSuccess, error } = await unlinkFvGrowerAccount({
      dealerSapId: selectedAccount.sapAccountId,
      growerIrdId: farmerDetails?.growerIrdId || ''
    })
    if (isSuccess) {
      updateFaste('appSessionData', {
        [appSessionKey]: { ...sessionData, GrowerFieldViewDetails: undefined }
      })
      refetchFarmerOffers()
      setUnLinkAction({ isLoading: false, isError: false, isSuccess: true })
      console.log('Unlinked FieldView Account')
    } else {
      console.error('Failed to unlink FieldView Account:', error)
      setUnLinkAction({ isLoading: false, isError: true, isSuccess: false })
    }
  }

  const LinkButton = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <Button leadingIcon={<FieldViewIcon fillOpacity={1} color='#F7A700' />} onClick={() => setOpenLinkModal(true)}>
        {t('farmers.farmerDetails.fieldView.linkButton.title')}
      </Button>
    </div>
  )

  const UnLinkButton = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <Button leadingIcon={<FieldViewIcon fillOpacity={1} color='#F7A700' />} onClick={() => setOpenUnLinkModal(true)}>
        {t('farmers.farmerDetails.fieldView.unlinkButton.title')}
      </Button>
      <Icon icon='link' />
      <TypoDisplay level={10}>{linkedGrowerFieldViewAccount?.fieldViewEmail || ''}</TypoDisplay>
    </div>
  )

  return (
    <div>
      <LinkFieldViewModal
        open={openLinkModal}
        setOpen={setOpenLinkModal}
        linkFieldView={handleLinkFieldView}
        farmerDetails={farmerDetails}
        actionDetails={linkAction}
        linkedAccounts={linkedGrowerAccs}
      />
      <UnLinkFieldViewModal
        open={openUnLinkModal}
        setOpen={setOpenUnLinkModal}
        unLinkFieldView={handleUnLinkFieldView}
        actionDetails={unLinkAction}
      />
      {getFieldViewLinkStatus() === 'linked' ? <UnLinkButton /> : <LinkButton />}
    </div>
  )
}

export default FieldViewLinkButton
