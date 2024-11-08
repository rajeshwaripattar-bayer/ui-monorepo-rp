import styles from './AdjustSplitModal.module.scss'
import { useEffect, useState, type ReactNode, useRef } from 'react'
import _ from 'lodash'
import type { BillToParty } from '@gc/types'
import { ModalTopBar, List, Badge, Contingency } from '@gc/components'
import { TypoSubtitle, TypoCaption } from '@element/react-typography'
import { Icon } from '@element/react-icon'
import { Button } from '@element/react-button'
import { Textfield } from '@element/react-textfield'
import { type RootState, useAppDispatch } from '../../store'
import { useTranslation } from 'react-i18next'
import { getAddedPayers } from '../../store/selectors/cartSelector'
import { setContingency, setNotification, setPayerList, setRemovePayer, useCartQueries } from '@gc/redux-store'
import { useSelector } from 'react-redux'
import { getInEditMode } from '../../store/selectors/quotesSelector'
import { useCurrentCart, useUpdateCartCache } from '../../hooks/useCurrentCart'
import { useSelectedAccount } from '@gc/hooks'
import { formatDateWithTimezoneOffset } from '@gc/utils'

export interface AdjustSplitModalProps {
  setModalProps: (props: { headerActions?: ReactNode; footerActions?: ReactNode }) => void
  openModal: (a: string, options?: { selectedPayer?: BillToParty; isAddPayer?: boolean }) => void
}

export function AdjustSplitModal(props: AdjustSplitModalProps) {
  const { setModalProps, openModal } = props
  const [totalPercentage, setTotalPercentage] = useState(0)
  const [enableApplyButton, setEnableApplyButton] = useState(false)
  const dispatch = useAppDispatch()
  const contingency = useSelector((state: RootState) => state.app.contingency)
  const { useUpdateCartAttributesMutation } = useCartQueries()
  const [updateCartAttributes, { retry }] = useUpdateCartAttributesMutation()
  const { data: cart } = useCurrentCart()
  const addedPayers = useSelector(getAddedPayers)
  const addedPayersCount = useRef<number>(addedPayers.length - (cart?.billToParties?.length || 0))
  const [inputPayers, setInputPayers] = useState<Array<BillToParty>>(
    addedPayersCount.current > 0 ? addedPayers : (cart?.billToParties as BillToParty[])
  )
  const { t } = useTranslation()
  const inEditMode = useSelector(getInEditMode)
  const [updateCartCache] = useUpdateCartCache()
  const sapAccountId = useSelectedAccount().sapAccountId

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    let value = event.target.value
    if (Number(value) > 100 || Number(value) < 0) {
      return
    }

    const decimalIndex = value.indexOf('.')
    if (decimalIndex !== -1 && value.substring(decimalIndex + 1).length > 2) {
      value = value.slice(0, decimalIndex + 3)
    }

    const inputs = _.cloneDeep(inputPayers)
    event.target.valueAsNumber = Math.abs(Number(value))
    inputs[index].percentage = Number(value)
    setInputPayers(inputs)
  }

  useEffect(() => {
    setTotalPercentage(inputPayers.reduce((a, b) => +a + +Number(b.percentage), 0))
  }, [inputPayers])

  useEffect(() => {
    setEnableApplyButton(
      totalPercentage === 100 &&
        inputPayers.filter((payer: BillToParty) => !payer.isPrimaryBillTo && payer.percentage === 0).length === 0
    )
  }, [inputPayers, totalPercentage])

  useEffect(() => {
    setModalProps({
      headerActions: (
        <ModalTopBar
          title={t('common.adjust_split.label')}
          exitIconButtonProps={{
            icon: inEditMode && addedPayersCount.current <= 0 ? 'close' : 'arrow_back',
            onClick: () => {
              dispatch(setContingency())
              if (inEditMode && addedPayersCount.current <= 0) {
                openModal('EXIT')
              } else {
                // Create Flow / Add payer mode
                if (addedPayersCount.current > 0) {
                  //there are some added payers
                  const lastAddedPayer: BillToParty = addedPayers[addedPayers.length - 1]
                  dispatch(setRemovePayer(lastAddedPayer)) //remove the last added payer from store
                  //go back to payment terms with the last added payer
                  openModal('SELECT_PAYMENT_TERMS', { selectedPayer: lastAddedPayer, isAddPayer: true })
                } else {
                  openModal('CREATE_QUOTE')
                }
              }
            }
          }}
          trailingContent={
            <Badge
              labelText={`${100 - totalPercentage}% Remaining`}
              themeColor={totalPercentage === 100 ? 'green' : 'red'}
            />
          }
        />
      ),
      footerActions: (
        <Button
          label={t('common.apply.label')}
          fullWidth
          disabled={!enableApplyButton || !!contingency}
          onClick={async () => {
            if (!cart) {
              return
            }
            await updateCartAttributes(
              {
                cartId: cart.code,
                attributes: {
                  grower: cart.grower,
                  agentSapId: sapAccountId,
                  billToParties: inputPayers,
                  name: cart.name,
                  cartType: 'QUOTE',
                  expirationDate: formatDateWithTimezoneOffset(cart.expirationDate)
                }
              },
              {
                dispatch,
                contingency: {
                  code: 'ADD_PAYER_FAILED',
                  displayType: 'alert',
                  alertProps: {
                    type: 'error',
                    variant: 'tonal',
                    title: t('common.add_payer_failed.label'),
                    description: t('common.refresh_page_to_fix.description'),
                    actionButtonProps: { label: t('common.try_again.label'), onClick: retry }
                  }
                }
              }
            )
            updateCartCache((draft) => {
              draft.billToParties = inputPayers
              return draft
            })

            let notificationMessage = `${t('common.adjust_split_success_message.label')}`
            if (addedPayersCount.current > 0) {
              notificationMessage = `${addedPayersCount.current} ${t('common.payer.label', {
                count: addedPayersCount.current
              })} ${t('common.added_to.label')} ${t('quotes.quote.label')}`
            }
            dispatch(setPayerList([]))
            dispatch(
              setNotification({
                open: true,
                message: notificationMessage
              })
            )
            inEditMode ? openModal('EXIT') : openModal('CREATE_QUOTE')
          }}
        />
      )
    })
  }, [
    enableApplyButton,
    totalPercentage,
    t,
    inEditMode,
    contingency,
    addedPayers,
    dispatch,
    updateCartCache,
    cart,
    inputPayers,
    updateCartAttributes,
    sapAccountId,
    retry,
    setModalProps,
    openModal
  ])

  const getStyledPayerListItems = () => {
    const items: Array<object> = []
    inputPayers.map((farmer: BillToParty, index: number) =>
      items.push({
        code: farmer,
        overlineText: farmer.isPrimaryBillTo && (
          <div className={styles.overline_text_wrapper}>
            <Badge labelText={t('common.primary.label')} />
          </div>
        ),
        primaryText: <TypoSubtitle level={2}>{farmer.name}</TypoSubtitle>,
        secondaryText: (
          <>
            <Icon icon='credit_card' iconSize={'xsmall'} className={styles.secondary_text_leading_icon} />
            <TypoCaption>{farmer.paymentTermDescription}</TypoCaption>
          </>
        ),
        trailingBlockWithAction: (
          <span className={styles.trailing_block_action_field}>
            <Textfield
              variant='outlined'
              value={farmer.percentage}
              type='number'
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleValueChange(event, index)}
              onBlur={(event: React.ChangeEvent<HTMLInputElement>) => handleValueChange(event, index)}
              onKeyPress={(event) => {
                if (event?.key === '-' || event?.key === '+') {
                  event.preventDefault()
                }
              }}
              dense
              maxlength={5}
              style={{ width: '50px' }}
            />
            <TypoCaption className={styles.percentage}>%</TypoCaption>
          </span>
        )
      })
    )
    return items
  }

  return (
    <>
      <Contingency className={styles.container_contingency} codes={['ADD_PAYER_FAILED']} types={['alert']} />
      <div className={styles.adjust_split}>
        <List items={getStyledPayerListItems()} listItemClassName={styles.adjust_split_list_item} noHover divider />
      </div>
    </>
  )
}

export default AdjustSplitModal
