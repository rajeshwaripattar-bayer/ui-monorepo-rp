import { ButtonProps } from '@element/react-button'
import { Grid, GridCol, GridRow } from '@element/react-grid'
import { Alert, Contingency, Header, Loading, MessageWithAction, StockOrderProductSection } from '@gc/components'
import { IS_MOBILE, resolutions, space } from '@gc/constants'
import { usePortalConfig, useScreenRes } from '@gc/hooks'
import { useOrdersQueries } from '@gc/redux-store'
import { StockOrder } from '@gc/types'
import { fetchStore, getUnconfirmedProductCount, removeRejectedItems } from '@gc/utils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import MediaQuery from 'react-responsive'
import styles from './StockOrderDetails.module.scss'
import _ from 'lodash'

/* eslint-disable-next-line */
export interface StockOrderProps {}

export function StockOrderDetails(_props: StockOrderProps) {
  const { t } = useTranslation()
  const portalConfig = usePortalConfig()
  const { useGetAllOrdersQuery } = useOrdersQueries()
  const res = useScreenRes()
  const selectedAccount = fetchStore('selectedAccount')
  const seedYear = portalConfig?.gcPortalConfig?.seedYear
  const {
    data = [],
    error,
    isLoading,
    refetch
  } = useGetAllOrdersQuery({
    isMobile: res <= resolutions.M1023,
    reqBody: {
      pageSize: 100,
      documentTypes: ['ZU3L'],
      agents: [selectedAccount.sapAccountId],
      salesYears: [portalConfig?.gcPortalConfig?.seedYear]
    }
  })

  const unConfirmedProductCount = useMemo(
    () => getUnconfirmedProductCount((data[0] as StockOrder)?.entries || []),
    [data]
  )

  const handleClickEdit = () => console.log('Edit was clicked')

  const handleAddProducts = () => console.log('Add Products was clicked')

  const mobileButtonProps: ButtonProps[] = [
    {
      label: t('common.add_products.label'),
      variant: 'outlined',
      onClick: () => handleAddProducts()
    },
    {
      label: t('common.edit.label'),
      variant: 'outlined',
      onClick: () => handleClickEdit()
    }
  ]

  const noMatchingDataContingency = useMemo(() => {
    return (
      <Contingency
        codes={['DEFAULT']}
        types={['messageWithAction']}
        className={styles.no_matching_data_contingency}
        contingency={{
          code: 'DEFAULT',
          displayType: 'messageWithAction',
          messageWithActionProps: {
            iconProps: {
              icon: 'info_outline',
              variant: 'filled-secondary',
              className: 'lmnt-theme-secondary-200-bg'
            },
            messageDescription: t('common.no_results_message_description'),
            messageHeader: t('common.no_matching_results_message_header_label')
          }
        }}
      />
    )
  }, [t])

  return isLoading || error ? (
    <Grid>
      <GridRow className={styles.container_contingency}>
        <GridCol desktopCol={12} tabletCol={8} phoneCol={4} verticalAlign='middle'>
          {isLoading ? (
            <Loading data-testid='loader' label={t('orders.loading_order_message.label')} />
          ) : (
            <MessageWithAction
              messageHeader={t('orders.could_not_load_order.label')}
              messageDescription={t('orders.could_not_load_order.description')}
              iconProps={{
                icon: 'info_outline',
                variant: 'filled-secondary',
                className: 'lmnt-theme-secondary-200-bg'
              }}
              primaryButtonProps={{
                label: t('common.try_again.label'),
                variant: 'text',
                onClick: refetch
              }}
            />
          )}
        </GridCol>
      </GridRow>
    </Grid>
  ) : (
    <>
      {unConfirmedProductCount > 0 && (
        <div className={`${styles.alert_container}`}>
          <Alert
            type='warning'
            variant='tonal'
            className={styles.alert}
            title={t('common.unconfirmed_products.label')}
            description={`${unConfirmedProductCount} of ${
              removeRejectedItems((data as StockOrder[])[0].entries).length
            } products has unconfirmed quantities`}
          />
        </div>
      )}

      <MediaQuery maxWidth={IS_MOBILE}>
        <div className={styles.header}>
          <Header
            overlineText={(data as StockOrder[])[0].statusText}
            title={seedYear + space + t('orders.stock_order.label')}
            buttonProps={mobileButtonProps}
          />
        </div>
      </MediaQuery>

      <StockOrderProductSection
        currencyIso='USD'
        orderStatus={data[0].statusText}
        entries={(data as StockOrder[])[0].entries || []}
        noMatchingDataContingency={noMatchingDataContingency}
        handleAddProductsClick={handleAddProducts}
        handleEdit={handleClickEdit}
      />
    </>
  )
}

export default StockOrderDetails
