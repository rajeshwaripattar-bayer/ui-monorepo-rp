import { Button } from '@element/react-button'
import { Grid, GridCol, GridRow } from '@element/react-grid'
import { Icon } from '@element/react-icon'
import { TextBubble } from '@element/react-text-bubble'
import { TypoDisplay, TypoSubtitle } from '@element/react-typography'
import {
  HeaderType,
  List,
  Loading,
  MessageWithAction,
  SearchBarMobile,
  Table,
  TableMenu,
  TableMenuListItem,
  TopBar
} from '@gc/components'
import { IS_DESKTOP, IS_MOBILE, resolutions } from '@gc/constants'
import { useAppSessionData, usePortalConfig, useScreenRes, useUpsertAppSessionData, useUser } from '@gc/hooks'
import { Farmer, FarmerDetails, PortalKey } from '@gc/types'
import { downloadXlsx, formatFarmerDetailsCSVData, getFasteStoreKey, sortByColConfig } from '@gc/utils'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MediaQuery from 'react-responsive'
import { useNavigate } from 'react-router-dom'

import { BackButton } from '../components'
import { useColumns, useFarmerDetails } from '../hooks'
import styles from './MyFarmers.module.scss'

export const MyFarmers = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { portalKey } = usePortalConfig()
  const appSessionData = useAppSessionData()
  const [upsertAppSessionData] = useUpsertAppSessionData()
  const res: number = useScreenRes()
  const {
    data: { farmerDetails } = { farmerDetails: [] },
    isLoading,
    isError,
    refetch: refetchFarmerDetails
  } = useFarmerDetails()

  const fasteStoreKey = getFasteStoreKey('farmers', 'farmers')
  const [searchTerm, setSearchTerm] = useState(_.get(appSessionData, `${fasteStoreKey}.searchTerm`, '') as string)
  const [openSearch, setOpenSearch] = useState(false)

  const { farmerListColumns, farmerDownloadReportColumns } = useColumns()

  const farmerListFasteStoreKey = getFasteStoreKey('farmers', 'farmerList')

  useEffect(() => {
    const existingAppSessionData = _.get(appSessionData, `${farmerListFasteStoreKey}`)
    if (!existingAppSessionData?.sortBy) {
      upsertAppSessionData(farmerListFasteStoreKey, {
        sortBy: [{ id: 'name', desc: false }]
      })
    }
  }, [appSessionData, farmerListFasteStoreKey, upsertAppSessionData])

  const headers = farmerListColumns.map((c) => {
    const column = { ...c } as HeaderType<Farmer | FarmerDetails>
    if (column.displayType === 'actionMenu' && c.actions?.length) {
      column.accessor = (_data) => {
        const allActions: {
          [key: string]: {
            value: string
            label: string
            onClick: () => void
          }
        } = {
          edit: { value: 'edit', label: t('common.edit.label'), onClick: () => console.log('Edit Clicked!') },
          viewDetails: {
            value: 'viewDetails',
            label: t('common.view_details.label'),
            onClick: () =>
              navigate(portalKey === PortalKey.Arrow ? (_data as Farmer).sourceId : '/farmer-info', {
                state: { _data }
              })
          },
          inactivate: {
            value: 'duplicate',
            label: t('common.inactivate.label'),
            onClick: () => console.log('Inactivate Clicked!')
          }
        }

        return (
          <TableMenu<Farmer>
            listItems={c.actions?.map((action) => allActions[action]) as TableMenuListItem[]}
            currentRow={_data as Farmer}
          />
        )
      }
    } else if (column.displayType === 'link') {
      column.onLinkClick = (_farmer: Farmer | FarmerDetails) => {
        navigate(portalKey === PortalKey.Arrow ? (_farmer as Farmer).sourceId : '/farmer-info', {
          state: { farmer: _farmer }
        })
      }
    }
    return column
  })

  const getMessageHeader = t(
    isError
      ? 'farmers_api_error_header_msg'
      : farmerDetails?.length === 0
      ? 'farmers.no_data_header_msg'
      : 'common.no_matching_results_message_header_label'
  )

  const getMessageDescription = t(
    isError
      ? 'farmer.api_error_description_msg'
      : farmerDetails?.length === 0
      ? 'farmers.no_data_description_msg'
      : 'common.no_results_message_description'
  )

  const getMessageContent = () => {
    return (
      <MessageWithAction
        messageHeader={getMessageHeader}
        messageDescription={getMessageDescription}
        primaryButtonProps={
          isError ? { label: t('common.try_again.label'), variant: 'text', onClick: refetchFarmerDetails } : undefined
        }
        iconProps={{
          icon: 'info_outline',
          variant: 'filled-secondary',
          className: 'lmnt-theme-secondary-200-bg'
        }}
      />
    )
  }

  const searchFun = (farmer: Farmer | FarmerDetails, searchStr: string) => {
    const hits = (value: string) => value?.toLowerCase().includes(searchStr)
    const name: string = getMobileFarmerName(farmer)
    const matchingQuote = (name: string) => hits(name)
    return matchingQuote(name)
  }

  const searchTableFun = (farmer: Farmer | FarmerDetails, searchStr: string) => {
    const hits = (value: string) => value?.toLowerCase().includes(searchStr)
    const matchingQuote = (farmer: Farmer) =>
      hits(farmer.name) ||
      hits(farmer.partyStatus) ||
      hits(farmer.sourceId) ||
      hits(farmer.relationshipStatus) ||
      hits(farmer.contracts && farmer.contracts.length > 0 ? farmer.contracts[0].contractStatus : '')
    return matchingQuote(farmer as Farmer)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleOpenSearch = () => {
    setOpenSearch(true)
  }

  const handleCloseSearch = () => {
    setSearchTerm('')
    setOpenSearch(false)
  }
  const handleCancelSearch = (_e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm('')
  }

  const goToFarmersDetails = <T,>(code: string, row: T | undefined) => {
    navigate(portalKey === PortalKey.Arrow ? `/${code}` : '/farmer-info', {
      state: { farmer: row ?? {} }
    })
  }

  const getMobileFarmerName = (farmer: Farmer | FarmerDetails) => {
    let name = ''
    if ('name' in farmer) name = farmer.name
    else name = farmer.farmName
    return name
  }

  const getMobileRedirectLink = (farmer: Farmer | FarmerDetails) => {
    let code = ''
    if ('sourceId' in farmer) code = farmer.sourceId
    else code = '/farmer-info'
    return code
  }

  const getMobileSortKey = () => (portalKey === PortalKey.Arrow ? 'name' : 'farmName')

  const farmerName = useUser().name

  return (
    <Grid className={styles.myFarmersContainer}>
      <GridRow
        className={`${styles.headerRow} ${
          portalKey === PortalKey.MyCrop ? styles.header_padding_partial : styles.header_padding_full
        }`}
      >
        {portalKey !== PortalKey.Arrow && (
          <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
            <BackButton />
          </GridCol>
        )}
        <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
          <TypoDisplay
            level={res > resolutions.M1023 ? 3 : 5}
            className={res <= resolutions.M1023 ? styles.welcome_msg_mobile : ''}
          >
            {`${t('common.farmerPage.headerLabel')}`}
            {portalKey === PortalKey.Arrow ? `, ${farmerName}` : ''}
          </TypoDisplay>
        </GridCol>
      </GridRow>
      {portalKey === PortalKey.MyCrop && (
        <GridRow className={styles.pageActionRow}>
          <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
            <Button
              variant='outlined'
              themeColor='primary'
              disabled={!farmerDetails?.length}
              buttonSize='small'
              onClick={() => {
                downloadXlsx(
                  farmerDownloadReportColumns as { displayName: string; id: string }[],
                  formatFarmerDetailsCSVData(farmerDetails as FarmerDetails[]),
                  'My-Farmers_Full-Farmer-Report_'
                )
              }}
            >
              <Icon icon='cloud_download' />
              {t('farmers.tables.farmerList.buttonLabel')}
            </Button>
          </GridCol>
        </GridRow>
      )}
      <GridRow className={styles.content}>
        {farmerDetails?.length > 0 ? (
          <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
            <MediaQuery minWidth={IS_DESKTOP}>
              <Table<Farmer | FarmerDetails>
                title={t('farmers.tables.farmerList.tableTitle')}
                data={sortByColConfig<Farmer | FarmerDetails>(farmerDetails, farmerListColumns)}
                headers={headers}
                searchable
                paginated
                enableCsvDownload
                csvFileName={'My-Farmers_Farmers_'}
                noContentMessage={
                  <MessageWithAction
                    messageHeader={t('common.no_results_message_header_label')}
                    messageDescription={t('common.no_results_message_description')}
                    iconProps={{
                      icon: 'info_outline',
                      variant: 'filled-secondary',
                      className: 'lmnt-theme-secondary-200-bg'
                    }}
                  />
                }
                fasteStoreKey={farmerListFasteStoreKey}
                {...(portalKey === PortalKey.Arrow ? { customSearchFn: searchTableFun } : {})}
              />
            </MediaQuery>

            <MediaQuery maxWidth={IS_MOBILE}>
              {openSearch || searchTerm !== '' ? (
                <SearchBarMobile
                  onClick={handleCancelSearch}
                  onChange={handleSearch}
                  searchTerm={searchTerm}
                  actionProps={{ icon: 'close', onClick: handleCloseSearch }}
                  className='farmer_search'
                />
              ) : (
                <TopBar
                  className='farmer_search'
                  title={t('common.farmer.label_other')[0].toUpperCase() + t('common.farmer.label_other').slice(1)}
                  trailingBlock={<Icon icon='search' style={{ marginTop: '4px' }} onClick={handleOpenSearch} />}
                />
              )}
              {farmerDetails.length > 0 ? (
                <div className={styles.farmer_list_container}>
                  <List<Farmer | FarmerDetails>
                    items={[]}
                    leadingBlockType={'icon'}
                    className={styles.farmer_list}
                    listItemClassName={styles.farmer_list_item}
                    divider={true}
                    onAction={goToFarmersDetails}
                    data={_.orderBy(farmerDetails, [getMobileSortKey()], ['asc']) as Farmer[] | FarmerDetails[]}
                    sortProps={{
                      options: [
                        {
                          label: t('common.name_a-z.label'),
                          columnName: getMobileSortKey(),
                          sortingType: 'asc'
                        },
                        {
                          label: t('common.name_z-a.label'),
                          columnName: getMobileSortKey(),
                          sortingType: 'desc'
                        }
                      ]
                    }}
                    searchTerm={searchTerm}
                    searchFn={searchFun}
                    fasteStoreKey={fasteStoreKey}
                    dataToListItem={(farmer: Farmer | FarmerDetails) => ({
                      code: getMobileRedirectLink(farmer),
                      row: farmer,
                      leadingBlock: (
                        <div className={styles.text_bubble}>
                          <TextBubble text={getMobileFarmerName(farmer).charAt(0)} themeColor='yellow' />
                        </div>
                      ),
                      primaryText: <TypoSubtitle level={2}>{getMobileFarmerName(farmer)}</TypoSubtitle>
                    })}
                  />
                </div>
              ) : (
                <MessageWithAction
                  messageHeader={t('common.no_results_message_header_label')}
                  messageDescription={t('common.no_results_message_description')}
                  iconProps={{
                    icon: 'info_outline',
                    variant: 'filled-secondary',
                    className: 'lmnt-theme-secondary-200-bg'
                  }}
                />
              )}
            </MediaQuery>
          </GridCol>
        ) : (
          <GridCol
            desktopCol={12}
            tabletCol={8}
            phoneCol={4}
            className={styles.container_contingency}
            verticalAlign='middle'
          >
            {isLoading ? <Loading label={t('common.loading_farmers_message.label')} /> : getMessageContent()}
          </GridCol>
        )}
      </GridRow>
    </Grid>
  )
}

export default MyFarmers
