import { Grid, GridCol, GridRow } from '@element/react-grid'
import styles from './OrderDetails.module.scss'
import { useOrdersQueries } from '@gc/redux-store'
import { OrderActionType, useOrderActions, usePortalConfig, useResetState, useScreenRes } from '@gc/hooks'
import { useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import MediaQuery from 'react-responsive'
import { IS_MOBILE, IS_DESKTOP, resolutions } from '@gc/constants'
import {
  ActionMenuButton,
  Alert,
  BillingSection,
  CropSummary,
  Header,
  Loading,
  MessageWithAction,
  ProductsSection,
  TopBar
} from '@gc/components'
import { useTranslation } from 'react-i18next'
import { Icon } from '@element/react-icon'
import { Button, ButtonProps } from '@element/react-button'
import { Cart, DomainDefGcPortalConfig } from '@gc/types'
import { getUnconfirmedProductCount, removeRejectedItems } from '@gc/utils'
import isUndefined from 'lodash/isUndefined'
import _, { noop } from 'lodash'

const ALL_ACTIONS: OrderActionType[] = ['viewStatement', 'shareWithFarmer', 'edit', 'duplicate', 'print', 'cancelOrder']

/* eslint-disable-next-line */
export interface OrderDetailsProps {}

export function OrderDetails(_props: OrderDetailsProps) {
  const res = useScreenRes()
  const { code } = useParams()
  const { t } = useTranslation()
  const portalConfig = usePortalConfig()
  const { useGetOrderDetailsQuery } = useOrdersQueries()

  const [showLoader, setShowLoader] = useState(true)
  const [_modalState, setModalState, _resetModalState] = useResetState({ open: false, name: '', props: {} })

  const inEditMode = false // use actual store for this
  // const inEditMode = useSelector(getInEditMode)
  const isMobile = res <= resolutions.M1023
  const cropList: DomainDefGcPortalConfig['cropList'] = portalConfig?.gcPortalConfig?.cropList

  const { data: orderDetails, isLoading, refetch } = useGetOrderDetailsQuery({ orderId: code || '', isMobile })

  const hasExclusions = useMemo(
    () => orderDetails?.entries.some((entry) => !entry.rejected && entry.product.canOrder === false),
    [orderDetails?.entries]
  )
  const unConfirmedProductCount = useMemo(
    () => getUnconfirmedProductCount(orderDetails?.entries || []),
    [orderDetails?.entries]
  )

  const allowedUserActions: OrderActionType[] = ALL_ACTIONS.filter((type) => {
    switch (type) {
      case 'edit':
        return isMobile
      case 'viewStatement':
        return orderDetails?.statusText === 'Fully Submitted'
      default:
        return true
    }
  })
  const listItemsDesktop = useOrderActions(allowedUserActions)

  let cart: Cart | undefined // use actual store for this
  const mobileButtonProps: ButtonProps[] = []
  const desktopButtonProps: ButtonProps[] = [
    {
      label: t('common.edit.label'),
      // onClick: () => handleClickEdit(),
      variant: 'outlined'
      // disabled: disableEditButton || inEditMode
    }
    // {
    //   label: t('orders.submit_order.label'),
    //   onClick: () => {},
    //   variant: 'filled'
    // }
  ].filter(Boolean) as ButtonProps[]

  const handleClickEdit = () => console.log('Edit was clicked')

  const openEditOrderModal = (modalName: string, modalProps?: NonNullable<unknown>) => {
    setModalState({
      open: true,
      name: modalName,
      props: modalProps || {}
    })
  }

  useEffect(() => {
    if (!isLoading && showLoader) setShowLoader(false)
  }, [isLoading, showLoader])

  useEffect(() => {
    if (isLoading || isUndefined(orderDetails)) return
    // setBrandDiscountData(getBrandDiscounts(orderDetails?.brandDiscounts || [], brandDiscounts))
  }, [cropList, isLoading, orderDetails])

  return (
    <>
      <MediaQuery maxWidth={IS_MOBILE}>
        <TopBar
          title={t('orders.view_order.label')}
          leadingBlock={<Icon icon='arrow_back' onClick={noop} />}
          trailingBlock={
            orderDetails?.statusText?.toLowerCase() !== 'converted' ? (
              <Button variant='outlined' label='Edit' onClick={() => handleClickEdit()} />
            ) : undefined
          }
        />
      </MediaQuery>
      <div className={`${styles.alert_container}`}>
        {hasExclusions && (
          <Alert
            type='error'
            variant='tonal'
            className={styles.alert}
            title={t('orders.contains_exclusions.title')}
            description={t('orders.contains_exclusions.description')}
          />
        )}
        {unConfirmedProductCount > 0 && (
          <Alert
            type='warning'
            variant='tonal'
            className={styles.alert}
            title={t('common.unconfirmed_products.label')}
            description={`${unConfirmedProductCount} of ${
              removeRejectedItems(orderDetails?.entries).length
            } products has unconfirmed quantities`}
          />
        )}
      </div>
      <Grid
        className={res <= resolutions.M719 ? `${styles.container} lmnt-theme-surface-variant-bg` : styles.container}
      >
        {/* {showLoader || error ? ( */}
        {showLoader ? (
          <GridRow className={styles.container_contingency}>
            <GridCol desktopCol={12} tabletCol={8} phoneCol={4} verticalAlign='middle'>
              {showLoader ? (
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
                    onClick: () => {
                      setShowLoader(true)
                      refetch()
                    }
                  }}
                />
              )}
            </GridCol>
          </GridRow>
        ) : (
          <>
            <div className={`${styles.header} lmnt-theme-surface-bg`}>
              <MediaQuery maxWidth={IS_MOBILE}>
                <Header
                  secText1={(inEditMode ? cart?.name : orderDetails?.name) || 'ORDER 1'}
                  overlineText={orderDetails?.statusText}
                  title={t('orders.order.label') + ' ' + orderDetails?.orderNumber}
                  buttonProps={inEditMode ? mobileButtonProps : []}
                  inEditMode={inEditMode}
                />
              </MediaQuery>
              <MediaQuery minWidth={IS_DESKTOP}>
                <Header
                  secText1={inEditMode ? cart?.name : orderDetails?.name}
                  overlineText={orderDetails?.statusText}
                  title={t('orders.order.label') + ' ' + orderDetails?.orderNumber}
                  buttonProps={!inEditMode ? desktopButtonProps : []}
                  moreActions={
                    !inEditMode
                      ? { buttonLabel: t('common.more.label'), data: orderDetails, listItems: listItemsDesktop }
                      : undefined
                  }
                  inEditMode={inEditMode}
                />
              </MediaQuery>
            </div>
            <GridRow className={styles.section}>
              <GridCol desktopCol={6} tabletCol={8} phoneCol={4}>
                <BillingSection
                  editIsLoading={false}
                  isLoading={isLoading}
                  inEditMode={inEditMode}
                  actions={{ openEditModal: openEditOrderModal }}
                  billToParties={inEditMode ? cart?.billToParties : orderDetails?.billToParties}
                />
              </GridCol>
              <GridCol desktopCol={6} tabletCol={8} phoneCol={4}>
                <div className={styles['crop-summary-section']}>
                  <CropSummary
                    title={t('orders.order_summary.label')}
                    summaryFor={t('orders.order.label')}
                    cropLevelDetails={(inEditMode ? cart?.cropLevelDetails : orderDetails?.cropLevelDetails) || []}
                  ></CropSummary>
                </div>
              </GridCol>
            </GridRow>
            <GridRow className={styles.section}>
              <GridCol desktopCol={12} tabletCol={8} phoneCol={4}>
                <ProductsSection
                  data={orderDetails}
                  inEditMode={inEditMode}
                  openModal={openEditOrderModal}
                  currencyIso='USD'
                  usage='order'
                />
              </GridCol>
            </GridRow>
          </>
        )}
      </Grid>
      <MediaQuery maxWidth={IS_MOBILE}>
        <ActionMenuButton
          leadingIcon='add'
          buttonLabel={t('common.actions.label')}
          actionItems={listItemsDesktop}
          data={orderDetails}
        />

        {/* <div className={styles.actions}>
          {inEditMode ? (
            <Button
              key='add_products'
              variant='outlined'
              label={t('common.add_products.label')}
              buttonSize='medium'
              fullWidth={res <= resolutions.M599}
              onClick={() => handleAddProductsClick('')}
            />
          ) : (
            <ActionMenuButton
              leadingIcon='add'
              buttonLabel={t('common.actions.label')}
              actionItems={listItemsDesktop}
              data={data}
            />
          )}
        </div> */}
      </MediaQuery>
    </>
  )
}

export default OrderDetails
