import { Icon } from '@element/react-icon'
import { TypoSubtitle } from '@element/react-typography'
import { Badge } from '@gc/components'
import { ProductWithPrice, ProductsByCrop, QuantityUpdateRequest } from '@gc/components/types'
import { interpunct, resolutions } from '@gc/constants'
import { useAppSessionData, useLocale, useScreenRes, useUpsertAppSessionData } from '@gc/hooks'
import { StorageLocation } from '@gc/types'
import { getCurrencyFormat, getFasteStoreKey } from '@gc/utils'
import _ from 'lodash'
import { Fragment, ReactNode, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import cornIcon from '../../../src/icons/icon-corn.svg'
import sorghumIcon from '../../../src/icons/icon-sorghum.svg'
import soyIcon from '../../../src/icons/icon-soybeans.svg'
import Table, { HeaderType } from '../../ui-common/table/Table'
import DiscountDetailsTable from '../discounts/DiscountDetailsTable'
import styles from './ProductListDesktop.module.scss'
import ProductListFooter from './ProductListFooter'
import ProductListHeader from './ProductListHeader'

export interface ProductListDesktopProps {
  title: string
  productsByCrop: ProductsByCrop[]
  currencyIso: string
  editModeProps?: {
    storageLocations: StorageLocation[]
    getMaxQuantity?: (quantity: string | number, product: ProductWithPrice) => number | undefined
    handleQuantityUpdate: (request: QuantityUpdateRequest) => void
    handleProductDelete: (product: ProductWithPrice) => void
    handleWarehouseUpdate: (
      location: { value: string; text: string },
      product: ProductWithPrice,
      applyAllRows?: boolean
    ) => void
    enableDeleteProduct?: boolean
    editActions?: ReactNode
    addProductsProps?: {
      buttonLabel: string
      onClick: (cropName: string) => void
    }
    enableWarehouseApplyToAll?: boolean
    handleDiscountsClick: (product: ProductWithPrice) => void
  }
  quantityAccessor?: string
  displayProductStatuses?: boolean
}

export function ProductListDesktop(props: Readonly<ProductListDesktopProps>) {
  const { t } = useTranslation()
  const { currencyIso, editModeProps, title, displayProductStatuses, quantityAccessor = 'quantity' } = props
  const locale = useLocale()
  const inEditMode = !!editModeProps
  const productDeleteEnabled = editModeProps?.enableDeleteProduct
  const res = useScreenRes()
  const isDesktop = res === resolutions.D1439
  const appSessionData = useAppSessionData()
  const [upsertAppSessionData] = useUpsertAppSessionData()
  const fasteStoreKey = getFasteStoreKey('quotes', 'productList')

  const getHeaders = useCallback(
    (crop: string): HeaderType<ProductWithPrice>[] => [
      {
        header: t('common.product_name.label'),
        accessor: 'name',
        id: 'name',
        defaultSort: 'asc',
        sortType: (x: any, y: any) => {
          const a: string = x.original.name ? x.original.name : ''
          const b: string = y.original.name ? y.original.name : ''
          return a.localeCompare(b)
        },
        widthPercentage: inEditMode ? 36 : 34,
        displayTemplate: (_value, product: ProductWithPrice) => {
          const unconfirmedQuantity =
            product.statusCounts?.find(({ status }) => status === 'common.unconfirmed.label')?.count || 0
          return (
            <>
              {product.name}&nbsp;
              {product.canOrder === false && <Badge themeColor='danger' labelText={t('common.on_exclusion.label')} />}
              {unconfirmedQuantity > 0 && (
                <Badge
                  themeColor='orange'
                  labelText={`${unconfirmedQuantity} ${t('common.unit.label_other')} ${t('common.unconfirmed.label')}`}
                />
              )}
              &nbsp;
            </>
          )
        }
      },
      {
        align: 'start',
        widthPercentage: 15,
        accessor: 'warehouse',
        header: t('common.warehouse.label'),
        displayTemplate: (storageLocation: { value: string; text: string }) => storageLocation?.text,
        ...(inEditMode
          ? {
              editProps: {
                editType: 'radioMenu' as const,
                radioMenuProps: {
                  onChange: editModeProps?.handleWarehouseUpdate,
                  options: editModeProps?.storageLocations.map((location) => ({
                    value: location.locationCode,
                    text: `${location.locationCode} - ${location.locationName}`
                  })),
                  applyToAllProps: editModeProps.enableWarehouseApplyToAll
                    ? {
                        label: `${t('common.apply_to_all.label')} ${crop} ${t('common.product.label', { count: 2 })}`
                      }
                    : undefined
                }
              }
            }
          : {})
      },

      {
        // Quotes Modules - Quantity & Order Modules - Net Quantity
        header: `${t(`common.${_.snakeCase(quantityAccessor)}.label`)} (${t('common.ssu.label')})`,
        accessor: quantityAccessor,
        widthPercentage: inEditMode ? 9 : 7,
        align: 'end',
        ...(inEditMode
          ? {
              editProps: {
                editType: 'textfield' as const,
                textfieldProps: {
                  type: 'number',
                  isWholeNumber: true,
                  placeholder: '0',
                  max: (quantity: string | number, product: ProductWithPrice) =>
                    editModeProps?.getMaxQuantity?.(quantity, product),
                  onChange: (quantity: string, product: ProductWithPrice) =>
                    editModeProps?.handleQuantityUpdate({ quantity, productWithPrice: product, onlyCache: true }),
                  onBlur: (quantity: string, product: ProductWithPrice) =>
                    editModeProps?.handleQuantityUpdate({ quantity, productWithPrice: product, onlyCache: false }),
                  onWheel: (e: React.WheelEvent<HTMLElement>) => e.currentTarget.blur()
                }
              },
              cellProps: { className: styles.qty_textfield }
            }
          : {})
      },
      {
        header: t('common.discount_per_unit.label'),
        accessor: 'discountPerUnit',
        align: 'right',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sortType: (x: any, y: any) => {
          const a: number = x.original.unitPrice - x.original.discountedUnitPrice
          const b: number = y.original.unitPrice - y.original.discountedUnitPrice
          return a - b
        },
        displayTemplate: (_val, product: ProductWithPrice) => {
          const appliedDiscount = product.discountedUnitPrice > 0 ? product.unitPrice - product.discountedUnitPrice : 0
          if (inEditMode) {
            return (
              <TypoSubtitle
                level={2}
                themeColor='primary'
                onClick={() => editModeProps?.handleDiscountsClick(product)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.discount_column_action}>
                  <div>
                    {getCurrencyFormat(currencyIso, appliedDiscount, locale)}
                    {interpunct}
                    {t('common.add.label')}
                  </div>
                  &nbsp;
                  <Icon icon='add_circle' />
                </div>
              </TypoSubtitle>
            )
          }
          return `-${getCurrencyFormat(currencyIso, appliedDiscount, locale)}`
        }
      },
      {
        header: t('common.unit_price.label'),
        sortType: (x: { original: ProductWithPrice }, y: { original: ProductWithPrice }) => {
          const { discountedUnitPrice: xD, unitPrice: xU } = x.original
          const { discountedUnitPrice: yD, unitPrice: yU } = y.original
          const a: number = xD || xU
          const b: number = yD || yU
          return a - b
        },
        accessor: 'discountedUnitPrice',
        displayTemplate: (_val, { unitPrice, discountedUnitPrice }: ProductWithPrice) => {
          const _unitPrice = getCurrencyFormat(currencyIso, unitPrice, locale)
          return unitPrice !== discountedUnitPrice ? (
            <>
              {getCurrencyFormat(currencyIso, discountedUnitPrice, locale)}&nbsp;
              <s>{_unitPrice}</s>
            </>
          ) : (
            _unitPrice
          )
        },
        align: 'end',
        widthPercentage: 13
      },
      {
        header: t('common.sub_total.label'),
        accessor: 'subTotal',
        align: 'end',
        widthPercentage: productDeleteEnabled ? 8.3 : 13.3,
        displayTemplate: (val: string, product: ProductWithPrice) =>
          getCurrencyFormat(
            currencyIso,
            inEditMode
              ? product.quantity > 0
                ? product.quantity * (product.discountedUnitPrice > 0 ? product.discountedUnitPrice : product.unitPrice)
                : 0
              : Number(val),
            locale
          )
      },
      ...(productDeleteEnabled
        ? [
            {
              header: '',
              displayTemplate: (_val: string, product: ProductWithPrice) => (
                <Icon
                  data-testid='delete-product'
                  icon={'close'}
                  className={styles.pointer}
                  onClick={() => editModeProps?.handleProductDelete(product)}
                />
              ),
              align: 'center',
              widthPercentage: 4,
              cellProps: { style: { paddingRight: '24px' } }
            }
          ]
        : [])
    ],
    [currencyIso, editModeProps, inEditMode, locale, productDeleteEnabled, quantityAccessor, t]
  )
  useEffect(() => {
    const existingAppSessionData = _.get(appSessionData, `${fasteStoreKey}`)
    if (!existingAppSessionData?.sortBy) {
      upsertAppSessionData(fasteStoreKey, {
        sortBy: [{ id: 'name', desc: false }]
      })
    }
  }, [appSessionData, fasteStoreKey, upsertAppSessionData])

  const getCropIcon = useCallback(
    (cropName: string) =>
      ({
        Corn: cornIcon,
        Soybean: soyIcon,
        Soybeans: soyIcon,
        Sorghum: sorghumIcon
      })[cropName],
    []
  )

  const renderDiscountDetails = (row: ProductWithPrice) => (
    <div id='discount_details_expansion_panel' className={styles.discount_details_expansion_panel}>
      <DiscountDetailsTable product={row} displayProductStatuses={displayProductStatuses} />
    </div>
  )

  const handleAddProductsClick = useCallback(
    (cropName: string) => {
      editModeProps?.addProductsProps?.onClick(cropName)
    },
    [editModeProps?.addProductsProps]
  )

  const containerClassName = `lmnt-theme-secondary-50-bg ${styles.header}`

  const renderProductTables = useMemo(
    () =>
      props.productsByCrop.map((item, index) => (
        <Fragment key={`${item.crop}${index}${inEditMode ? 'edit' : 'read'}`}>
          <Table<ProductWithPrice>
            noHover
            className={inEditMode ? styles.table : `${styles.table} ${styles.expandable_table}`}
            headers={getHeaders(item.crop)}
            data={item.products}
            style={{ border: 'none' }}
            fasteStoreKey={fasteStoreKey}
            customTopBar={
              <ProductListHeader
                icon={<img alt='' src={getCropIcon(item.crop)} />}
                crop={item.crop}
                count={item.products.length}
                averagePrice={item.avgPrice}
                currencyIso={currencyIso}
                containerClassName={containerClassName}
                {...(inEditMode && {
                  trailingIconButtonProps: {
                    icon: 'add_circle',
                    variant: 'secondary-on-surface',
                    onClick: () => handleAddProductsClick(item.crop)
                  }
                })}
              />
            }
            {...(!inEditMode && {
              expandedRowTemplate: ({ row }: { row: { original: ProductWithPrice } }) =>
                renderDiscountDetails(row.original)
            })}
            editable={inEditMode}
          />
          <ProductListFooter crop={item.crop} currencyIso={currencyIso} {...item.summary} />
        </Fragment>
      )),
    [containerClassName, currencyIso, getHeaders, handleAddProductsClick, inEditMode, isDesktop, props.productsByCrop]
  )

  return (
    <div className={styles.container}>
      <div className={styles.sub_heading}>
        <TypoSubtitle bold level={1}>
          {title}
        </TypoSubtitle>
        {editModeProps?.editActions && <div className={styles.sub_heading_action}>{editModeProps?.editActions}</div>}
      </div>
      {renderProductTables}
    </div>
  )
}

export default ProductListDesktop
