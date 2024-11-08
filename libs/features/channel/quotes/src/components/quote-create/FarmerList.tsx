import styles from './FarmerList.module.scss'
import { useState, useEffect, type ReactNode, useCallback } from 'react'
import { List, Loading, MessageWithAction, Badge, ModalTopBar, SearchBarMobile } from '@gc/components'
import { TextBubble } from '@element/react-text-bubble'
import { TypoSubtitle, TypoOverline } from '@element/react-typography'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '../../store'
import { clearBrandDiscount, setPayerList, setRemovePayer, useUpdateCartAttributesMutation } from '@gc/redux-store'
import type { BillToParty, Farmer, OrderConfig, SapSalesArea } from '@gc/types'
import { Grid } from '@element/react-grid'
import { getAddedPayers } from '../../store/selectors/cartSelector'
import { getInEditMode } from '../../store/selectors/quotesSelector'
import { useSelector } from 'react-redux'
import { useGetFarmersQuery } from '../../store/slices/configDataSlice'
import { useSelectedAccount, usePortalConfig } from '@gc/hooks'
import { useCurrentCart, useUpdateCartCache } from '../../hooks/useCurrentCart'
import _ from 'lodash'

export interface FarmerListProps {
  isAddPayer?: boolean
  setModalProps: (props: { headerActions?: ReactNode; footerActions?: ReactNode }) => void
  openModal: (a: string, options?: { selectedPayer?: BillToParty; isAddPayer?: boolean }) => void
}

export function FarmerList({ isAddPayer, setModalProps, openModal }: FarmerListProps) {
  const dispatch = useAppDispatch()
  const [noData, setNoData] = useState(false)
  const [noSearchResult, setNoSearchResult] = useState(false)
  const [farmersData, setFarmersData] = useState<Array<Farmer>>([])
  const [openSearch, setOpenSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null)
  const { data: cart, isError: cartError } = useCurrentCart()
  if (cartError) {
    openModal('EXIT')
  }
  const addedPayers = useSelector(getAddedPayers)
  const inEditMode = useSelector(getInEditMode)
  const [updateCartCache] = useUpdateCartCache()
  const [updateCartAttributes] = useUpdateCartAttributesMutation()
  const sapAccountId = useSelectedAccount().sapAccountId

  const portalConfig = usePortalConfig() //Fetch portal config
  const orderConfig: OrderConfig = portalConfig?.gcPortalConfig?.orderConfig

  const { t } = useTranslation()

  const { data, isLoading, error, refetch } = useGetFarmersQuery({ sapId: sapAccountId })

  useEffect(() => {
    setNoData(!!(data?.farmerDetails.length === 0 && !isLoading))
  }, [isLoading, data?.farmerDetails.length])

  useEffect(() => {
    const farmersData = isAddPayer ? excludePayerList(addedPayers || [], data?.farmerDetails) : data?.farmerDetails
    if (searchTerm) searchFarmers(searchTerm, farmersData)
    else {
      setFarmersData(farmersData || [])
      setNoSearchResult(false)
    }
  }, [searchTerm, addedPayers, isAddPayer, data])

  const excludePayerList = (payerList: Array<BillToParty>, farmersData: Array<Farmer> | undefined) => {
    if (farmersData) return farmersData.filter(({ sourceId }) => !payerList.some((e) => e.sapAccountId === sourceId))
  }

  const searchFarmers = (searchStr: string, farmersData: Array<Farmer> | undefined) => {
    if (searchStr.trim().length > 0 && farmersData) {
      searchStr = searchStr.toLowerCase()
      const searchData = farmersData.filter((row: Farmer) => row.name && row.name.toLowerCase().indexOf(searchStr) > -1)
      setFarmersData(searchData)
      searchData.length === 0 ? setNoSearchResult(true) : setNoSearchResult(false)
    } else {
      setFarmersData(farmersData || [])
    }
  }

  const getSortedUniqFarmerList = (farmers: Array<Farmer>, uniqBy: string, sortBy: string) => {
    const uniqData = _.uniqBy(farmers, uniqBy)
    return _.sortBy(uniqData, sortBy)
  }

  const getStyledListItems = (farmers: Array<Farmer>) => {
    const items: Array<object> = []
    farmers = getSortedUniqFarmerList(farmers, 'sourceId', 'name')
    farmers.map(
      (farmer: Farmer) =>
        farmer.name &&
        items.push({
          code: farmer,
          leadingBlock: (
            <div className={styles.text_bubble}>
              <TextBubble text={farmer.name?.charAt(0)} themeColor='yellow' />
            </div>
          ),
          primaryText: <TypoSubtitle level={2}>{farmer.name}</TypoSubtitle>
        })
    )
    return items
  }

  const getStyledPayerListItems = (BillToParty: Array<BillToParty>) => {
    const items: Array<object> = []
    BillToParty.forEach((payer: BillToParty) => {
      items.push({
        code: payer,
        leadingBlock: (
          <TextBubble className={styles.farmer_list_item} text={payer.name?.charAt(0)} themeColor='yellow' />
        ),
        overlineText: payer.isPrimaryBillTo && (
          <div className={styles.overline_text_wrapper}>
            <Badge labelText={t('common.primary.label')} />
          </div>
        ),
        primaryText: <TypoSubtitle level={2}>{payer.name}</TypoSubtitle>
      })
    })
    return items
  }

  const getMessageHeader = t(
    error
      ? 'farmers_api_error_header_msg'
      : noData
        ? 'farmers.no_data_header_msg'
        : 'common.no_matching_results_message_header_label'
  )

  const getMessageDescription = t(
    error
      ? 'farmer.api_error_description_msg'
      : noData
        ? 'farmers.no_data_description_msg'
        : 'common.no_results_message_description'
  )

  const getMessageContent = () => {
    const buttonProps = error ? { label: t('common.try_again.label'), variant: 'text', onClick: refetch } : undefined
    return (
      <div className={styles.msg_container}>
        <MessageWithAction
          messageHeader={getMessageHeader}
          messageDescription={getMessageDescription}
          primaryButtonProps={buttonProps}
          iconProps={{
            icon: 'info_outline',
            variant: 'filled-secondary',
            className: 'lmnt-theme-secondary-200-bg'
          }}
        />
      </div>
    )
  }

  const getFarmerSalesOffice = useCallback(
    (sapSalesAreas: SapSalesArea[]) => {
      const salesArea = sapSalesAreas.filter(
        (item: SapSalesArea) => item.distributionChannel === orderConfig.distributionChannel
      )
      return salesArea.length > 0 ? salesArea[0] : { salesOffice: '', salesGroup: '', salesDistrict: '' }
    },
    [orderConfig.distributionChannel]
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFarmerSelection = (farmer: any) => {
    if (isAddPayer) {
      const selectedPayer: BillToParty = {
        isPrimaryBillTo: false,
        paymentTerm: 'Z725',
        percentage: 0,
        sapAccountId: farmer.sourceId,
        name: farmer.name,
        paymentTermDescription: 'Prepay/Standard Terms-Due July 25'
      }
      openModal('SELECT_PAYMENT_TERMS', { selectedPayer, isAddPayer: true })
    } else {
      setSelectedFarmer(farmer)
    }
  }

  const handleCloseSearch = () => {
    setSearchTerm('')
    setOpenSearch(false)
  }

  const handleCancelSearch = (_e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm('')
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const getModalExitIcon = () => {
    if (!isAddPayer || (isAddPayer && inEditMode && addedPayers.length === (cart?.billToParties.length || 0)))
      return 'close'
    return 'arrow_back'
  }
  useEffect(() => {
    setModalProps({
      headerActions: (
        <ModalTopBar
          title={!isAddPayer ? t('common.select_farmer.label') : t('common.add_payer.label')}
          exitIconButtonProps={{
            icon: getModalExitIcon(),
            onClick: () => {
              if (getModalExitIcon() === 'close') {
                openModal('EXIT')
              } else {
                // Add payer mode
                if (addedPayers.length > (cart?.billToParties.length || 0)) {
                  //there are some added payers
                  const lastAddedPayer: BillToParty = addedPayers[addedPayers.length - 1]
                  dispatch(setRemovePayer(lastAddedPayer)) //remove the last added payer from store
                  //go back to payment terms with the last added payer
                  openModal('SELECT_PAYMENT_TERMS', { selectedPayer: lastAddedPayer, isAddPayer: true })
                } else {
                  dispatch(setPayerList([]))
                  openModal('CREATE_QUOTE')
                }
              }
            }
          }}
          trailingIconButtonProps={{
            icon: 'search',
            onClick: () => {
              setOpenSearch(true)
            }
          }}
          {...(openSearch && {
            topBarContent: (
              <Grid className={styles.search_grid}>
                <SearchBarMobile
                  onChange={handleSearch}
                  onClick={handleCancelSearch}
                  searchTerm={searchTerm}
                  actionProps={{ icon: 'close', onClick: handleCloseSearch }}
                />
              </Grid>
            )
          })}
        />
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSearch, searchTerm])

  useEffect(() => {
    if (cart && selectedFarmer) {
      const existingPrimaryPayer = cart?.billToParties?.find((payer) => payer.isPrimaryBillTo)
      if (existingPrimaryPayer?.name !== selectedFarmer.name) {
        setSelectedFarmer(null)
        const salesHierarchyInfo = getFarmerSalesOffice(selectedFarmer.sapSalesAreas)
        updateCartCache((draft) => {
          draft.billToParties = [
            {
              isPrimaryBillTo: true,
              paymentTerm: 'Z725',
              percentage: 100,
              sapAccountId: selectedFarmer.sourceId,
              name: selectedFarmer.name,
              paymentTermDescription: 'Prepay/Standard Terms-Due July 25'
            }
          ]
          draft.grower = selectedFarmer.sourceId
          draft.agentSapId = sapAccountId
          draft.cartType = 'QUOTE'
          draft.growerStateCode = selectedFarmer.address[0].stateProvinceCode
          draft.growerCountyCode = selectedFarmer.address[0].countyDivision?.code
          draft.salesOffice = salesHierarchyInfo.salesOffice
          draft.salesGroup = salesHierarchyInfo.salesGroup
          draft.salesDistrict = salesHierarchyInfo.salesDistrict
          return draft
        })
        if (cart) {
          // TODO - This is a duplicate update between FarmerList and CreateQuoteModal - needs a refactor once changes to create quote from Farmers module is merged!
          updateCartAttributes({
            cartId: cart.code,
            attributes: {
              cartType: 'QUOTE',
              distributionChannel: orderConfig.distributionChannel,
              division: orderConfig.division,
              documentType: orderConfig.documentType,
              grower: selectedFarmer.sourceId,
              agentSapId: sapAccountId,
              salesOrg: orderConfig.salesOrg,
              salesYear: orderConfig.salesYear,
              billToParties: [
                {
                  isPrimaryBillTo: true,
                  paymentTerm: 'Z725',
                  percentage: 100,
                  sapAccountId: selectedFarmer.sourceId,
                  name: selectedFarmer.name,
                  paymentTermDescription: 'Prepay/Standard Terms-Due July 25'
                }
              ],
              stateCode: selectedFarmer.address[0].stateProvinceCode,
              county: selectedFarmer.address[0].countyDivision?.code,
              salesOffice: salesHierarchyInfo.salesOffice,
              salesGroup: salesHierarchyInfo.salesGroup,
              salesDistrict: salesHierarchyInfo.salesDistrict
            }
          }).unwrap()
        }
        dispatch(clearBrandDiscount())
        openModal('CREATE_QUOTE')
      }
    }
  }, [
    cart,
    dispatch,
    getFarmerSalesOffice,
    openModal,
    orderConfig.distributionChannel,
    orderConfig.division,
    orderConfig.documentType,
    orderConfig.salesOrg,
    orderConfig.salesYear,
    sapAccountId,
    selectedFarmer,
    updateCartAttributes,
    updateCartCache
  ])

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.farmer_list_loader}>
          <Loading label={t('common.loading_farmers_message.label')} />
        </div>
      ) : error || noData ? (
        getMessageContent()
      ) : (
        <>
          {isAddPayer && (
            <>
              <div className={styles.farmer_list_on_the_bill_title}>
                <TypoOverline>{t('common.on_the_bill.label')}</TypoOverline>
              </div>
              <List
                items={getStyledPayerListItems(addedPayers || [])}
                listItemClassName={styles.farmer_list_item}
                divider
                noHover
              />
              <div className={styles.farmer_list_other_farmers_title}>
                <TypoOverline>{t('common.other_farmers.label')}</TypoOverline>
              </div>
            </>
          )}
          {noSearchResult ? (
            getMessageContent()
          ) : (
            <List
              items={getStyledListItems(farmersData)}
              listItemClassName={styles.farmer_list_item}
              divider
              onAction={handleFarmerSelection}
            />
          )}
        </>
      )}
    </div>
  )
}

export default FarmerList
