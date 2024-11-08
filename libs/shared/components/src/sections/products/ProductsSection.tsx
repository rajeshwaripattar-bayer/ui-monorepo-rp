import { Button, ButtonProps } from '@element/react-button'
import { Group } from '@element/react-group'
import { TypoSubtitle } from '@element/react-typography'
import { IS_DESKTOP, IS_MOBILE, resolutions } from '@gc/constants'
import { t } from 'i18next'
import MediaQuery from 'react-responsive'
import ProductListDesktop from '../../features/products/ProductListDesktop'
import ProductListMobile from '../../features/products/ProductListMobile'
import Loading from '../../ui-common/loading/Loading'
// import styles from './ProductsSection.module.scss'
import { ProductsByCrop, ProductWithPrice, QuantityUpdateRequest } from '@gc/components/types'
import { useCurrentCart, useLocale, usePortalConfig, useSaveEntries, useScreenRes, useUpdateCartCache } from '@gc/hooks'
import {
  addSaveInProgressEntry,
  getCartId,
  getSaveInProgressEntries,
  removeSaveInProgressEntry,
  setSelectedProductCrop,
  useCartQueries,
  useConfigDataQueries,
  useGlobalDispatch
} from '@gc/redux-store'
import {
  BillToParty,
  Cart,
  CropLevelDetail,
  DomainDefGcPortalConfig,
  Entry,
  Product,
  RecommendedRange,
  StorageLocation
} from '@gc/types'
import { getMatchingCartEntryUsingProduct, getProductsByCropFromEntries, removeRejectedItems } from '@gc/utils'
import cloneDeep from 'lodash/cloneDeep'
import isNumber from 'lodash/isNumber'
import isUndefined from 'lodash/isUndefined'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import isEqual from 'react-fast-compare'
import { useSelector } from 'react-redux'
import _ from 'lodash'

export type ProductsSectionData = {
  entries: Entry[]
  cropLevelDetails: CropLevelDetail[]
}

export type ProductsModalProps = {
  quoteId?: string
  name?: string
  expirationDate?: string
  originalExpirationDate?: string
  originalName?: string
  isAddPayer?: boolean
  selectedPayer?: BillToParty
  product?: Product
  entry?: Entry
  showNonDiscretionaryDiscount?: boolean
  productWithPrice?: ProductWithPrice
  recommendedRange?: RecommendedRange[]
  getMaxQuantity?: (quantity: string | number, product: ProductWithPrice) => number | undefined
  handleQuantityUpdate?: (request: QuantityUpdateRequest) => void
  handleStorageLocationUpdate?: (
    location: { value: string; text: string },
    product: ProductWithPrice,
    applyAllRows?: boolean
  ) => void
}

/* eslint-disable-next-line */
export interface ProductsSectionProps<T extends ProductsSectionData> {
  usage?: 'order'
  data: T | undefined
  currencyIso: string | undefined
  inEditMode: boolean
  openModal: (modalName: string, modalProps?: ProductsModalProps) => void
}

function _ProductsSection<T extends ProductsSectionData>({
  currencyIso = '',
  inEditMode,
  data,
  openModal,
  usage
}: ProductsSectionProps<T>) {
  const dispatch = useGlobalDispatch()
  const portalConfig = usePortalConfig()
  const locale = useLocale()
  const cartId = useSelector(getCartId)
  const res = useScreenRes()

  const isMobile = res <= resolutions.M1023
  const isSmallMobile = res <= resolutions.M719
  const title = useMemo(
    () => (usage === 'order' ? t('orders.ordered_products.label') : t('common.quoted_products.label')),
    [usage]
  )
  const quantityAccessor = useMemo(() => (usage === 'order' ? 'netQuantity' : 'quantity'), [usage])
  const [updateCartCache] = useUpdateCartCache()
  const [saveEntries] = useSaveEntries()
  const { useDeleteCartEntryMutation } = useCartQueries()
  const [deleteEntry, { retry: retryDeleteEntry, cancel: cancelDeleteEntry }] = useDeleteCartEntryMutation()
  const saveInProgressEntries = useSelector(getSaveInProgressEntries)

  const [productsByCrop, setProductsByCrop] = useState<ProductsByCrop[]>([])

  const cropList: DomainDefGcPortalConfig['cropList'] = portalConfig?.gcPortalConfig?.cropList
  const { data: cart, refetch: refetchCart } = useCurrentCart({
    skip: !cartId || !inEditMode //|| editQuoteLoading
  })
  const cartRef = useRef<Cart>()
  cartRef.current = cart

  const { useGetStorageLocationsQuery } = useConfigDataQueries()
  const { data: storageLocations } = useGetStorageLocationsQuery(cart?.warehouse?.code || '', {
    skip: !cart?.warehouse?.code
  })
  const storageLocationsRef = useRef<typeof storageLocations>([])
  storageLocationsRef.current = storageLocations

  const dataSource = useMemo(() => (inEditMode ? cart : data), [cart, data, inEditMode])

  const getUpdatedEntry = useCallback(
    (product: ProductWithPrice, qty: string | number, storageLocation?: StorageLocation) => {
      const quantity = Number(qty)
      return {
        cropCode: cropList.find((crop) => crop.cropName === product?.cropName)?.cropCode || '',
        cropName: product?.cropName,
        product: { code: product?.code, name: product?.name },
        quantity,
        storageLocation: (storageLocation && { ...storageLocation }) || (storageLocations && { ...storageLocations[0] })
      }
    },
    [cropList, storageLocations]
  )

  const handleQuantityUpdate = (req: QuantityUpdateRequest) => {
    const { quantity, productWithPrice, onlyCache = true } = req
    return quantity === '0' && !onlyCache ? handleProductDelete(productWithPrice) : updateQuantity(req)
  }

  /**
   * Grab quantity from quote product
   */
  const getQtyFromQuote = (product: ProductWithPrice) => {
    if (!dataSource?.entries) return 0
    return getMatchingCartEntryUsingProduct(removeRejectedItems(dataSource?.entries), product)?.quantity || 0
  }

  /**
   * Permanent exclusion products cannot increase the quantity
   */
  const canUpdatePositiveQuantity = (quantity: string | number, product: ProductWithPrice): boolean => {
    if (isUndefined(product)) return true

    const isPermanentExclusion = product.canView === false && product.canOrder === false
    const isPositiveQuantity = Number(quantity) > getQtyFromQuote(product)
    if (isPermanentExclusion && isPositiveQuantity) return false
    return true
  }

  const getMaxQuantity = (quantity: string | number, productWithPrice: ProductWithPrice) => {
    if (!canUpdatePositiveQuantity(quantity, productWithPrice)) return getQtyFromQuote(productWithPrice)
  }

  const updateQuantity = (request: QuantityUpdateRequest) => {
    const { quantity, productWithPrice } = request
    if (!canUpdatePositiveQuantity(quantity, productWithPrice)) return

    return new Promise<{ isSuccess: boolean } | null>((resolve) =>
      updateCartCache((draft: Cart) => {
        const onlyCache = request.onlyCache
        draft.entries = draft.entries ?? []
        const matchingEntry = getMatchingCartEntryUsingProduct(draft.entries, productWithPrice)
        const entry = getUpdatedEntry(productWithPrice, quantity, matchingEntry?.storageLocation)
        dispatch(addSaveInProgressEntry(entry))

        if (onlyCache) {
          if (matchingEntry) {
            matchingEntry.quantity = entry.quantity
          } else {
            draft.entries.push(entry)
          }
          resolve(null)
        } else {
          saveEntries(
            {
              cartId: draft?.code || '',
              data: {
                orderEntries: [
                  {
                    ...entry,
                    storageLocationCode: entry.storageLocation?.locationCode,
                    entryNumber: matchingEntry?.entryNumber
                  }
                ]
              },
              skipCartRefetch: true
            },
            { contingencyType: request.contingencyType }
          )
            .then((res) => resolve(res))
            .finally(() =>
              refetchCart()
                .unwrap()
                .then(() => dispatch(removeSaveInProgressEntry(entry)))
            )
        }
        return draft
      })
    )
  }

  const handleProductDelete = (product: ProductWithPrice) => {
    let entry: Entry | undefined
    updateCartCache((draft: Cart) => {
      const matchingEntryIndex = draft.entries?.findIndex(
        (entry) =>
          entry.product.code === product.code &&
          entry.storageLocation?.locationCode === product.warehouse.value &&
          !entry.rejected
      )
      if (matchingEntryIndex !== -1) {
        entry = cloneDeep(draft.entries[matchingEntryIndex])
        draft.entries?.splice(matchingEntryIndex, 1)
      }
      return draft
    })

    if (entry && isNumber(entry.entryNumber)) {
      deleteEntry(
        {
          cartId: cartRef.current?.code || '',
          entryNumber: entry.entryNumber
        },
        {
          dispatch,
          contingency: {
            code: 'REMOVE_PRODUCT_FAILED',
            onDismissAction: cancelDeleteEntry,
            displayType: 'dialog',
            dialogProps: {
              title: `${t('common.remove.label')} ${entry.product.name} ${t('common.action_failed_label')}`,
              message: t('common.refresh_page_to_fix.description'),
              open: true,
              actionButtonProps: {
                label: t('common.try_again.label'),
                onAction: retryDeleteEntry
              }
            }
          }
        }
      )
    }
  }

  const handleSelectedLocation = useCallback(
    (location: { value: string; text: string }, product: ProductWithPrice, applyWarehouseToAllProducts?: boolean) => {
      updateCartCache((draft: Cart) => {
        draft.entries = draft.entries ?? []
        const matchingEntry = getMatchingCartEntryUsingProduct(draft.entries, product)
        const selectedWarehouse = storageLocationsRef.current?.find((l) => l.locationCode === location.value)

        if (applyWarehouseToAllProducts) {
          const entriesToUpdate: Entry[] = []
          const matchingCropProducts = productsByCrop.find((p) => p.crop === product.cropName)?.products
          matchingCropProducts?.forEach((matchingCropProduct) => {
            const matchingEntry = getMatchingCartEntryUsingProduct(draft.entries, matchingCropProduct, true)
            if (matchingEntry) {
              const entry = getUpdatedEntry(matchingCropProduct, matchingEntry?.quantity ?? 0, selectedWarehouse)
              matchingEntry.storageLocation = selectedWarehouse
              entriesToUpdate.push({ ...entry, entryNumber: matchingEntry.entryNumber })
            }
          })

          saveEntries({
            cartId: draft?.code || '',
            data: {
              orderEntries: entriesToUpdate.map((entry) => ({
                ...entry,
                storageLocationCode: entry.storageLocation?.locationCode,
                entryNumber: entry.entryNumber
              }))
            },
            updateMethod: 'PUT'
          })
        } else {
          const entry = getUpdatedEntry(product, matchingEntry?.quantity || 0, selectedWarehouse)

          if (matchingEntry) {
            matchingEntry.storageLocation = entry.storageLocation
            saveEntries({
              cartId: draft?.code || '',
              data: {
                orderEntries: [
                  {
                    ...entry,
                    storageLocationCode: entry.storageLocation?.locationCode,
                    entryNumber: matchingEntry?.entryNumber
                  }
                ]
              }
            })
          } else {
            draft.entries.push(entry)
          }
        }
        return draft
      })
    },
    [getUpdatedEntry, productsByCrop, saveEntries, updateCartCache]
  )

  const handleClickAddDiscounts = (product: ProductWithPrice) => {
    const matchingEntry = getMatchingCartEntryUsingProduct(cartRef.current?.entries, product)
    openModal('ADD_DISCOUNTS', {
      entry: matchingEntry,
      productWithPrice: product,
      getMaxQuantity,
      handleQuantityUpdate,
      handleStorageLocationUpdate: handleSelectedLocation
    })
  }

  const handleAdjustBrandDiscount = useCallback(() => {
    openModal('CREATE_QUOTE', { showNonDiscretionaryDiscount: true })
  }, [openModal])

  const handleAddProductsClick = useCallback(
    (cropName: string) => {
      dispatch(setSelectedProductCrop(cropName))
      openModal('SELECT_PRODUCTS')
    },
    [dispatch, openModal]
  )

  const handleProductLineClicked = useCallback(
    (product: ProductWithPrice) => {
      const matchingEntry = getMatchingCartEntryUsingProduct(dataSource?.entries, product)
      if (matchingEntry) {
        openModal('PRODUCT_DETAILS', {
          entry: matchingEntry
        })
      }
    },
    [openModal]
  )

  const AddProductsButton = useCallback(
    (buttonProps?: ButtonProps) => (
      <Button
        key='add_products'
        variant='outlined'
        leadingIcon='add'
        label={t('common.add_products.label')}
        buttonSize='medium'
        fullWidth={res <= resolutions.M599}
        onClick={() => handleAddProductsClick('')}
        {...buttonProps}
      />
    ),
    [handleAddProductsClick, res]
  )
  const EditBrandDiscountsButton = useCallback(
    (buttonProps?: ButtonProps) => (
      <Button
        key='edit_brand_discounts'
        variant='outlined'
        label={t('common.adjust_brand_discounts.label')}
        buttonSize='medium'
        fullWidth={res <= resolutions.M599}
        onClick={handleAdjustBrandDiscount}
        {...buttonProps}
      />
    ),
    [handleAdjustBrandDiscount, res]
  )

  const EditActions = useCallback(() => {
    const direction = isSmallMobile ? 'vertical' : 'horizontal'
    const actions = [<EditBrandDiscountsButton key='edit-discount-btn' />, <AddProductsButton key='add-products-btn' />]

    return (
      <Group gap='dense' direction={direction} secondaryAlign='center'>
        {isMobile ? actions.reverse() : actions}
      </Group>
    )
  }, [AddProductsButton, EditBrandDiscountsButton, isMobile, res, isSmallMobile])

  useEffect(() => {
    if (dataSource?.entries) {
      const _productsByCrop = getProductsByCropFromEntries(
        dataSource?.entries,
        saveInProgressEntries,
        dataSource?.cropLevelDetails,
        locale,
        cropList
      )
      if (!_.isEqual(productsByCrop, _productsByCrop)) {
        setProductsByCrop(_productsByCrop)
      }
    }
  }, [cropList, dataSource?.cropLevelDetails, dataSource?.entries, locale, saveInProgressEntries])

  return (
    <>
      <MediaQuery maxWidth={IS_MOBILE}>
        <ProductListMobile
          titleText={
            <TypoSubtitle level={1} bold>
              {title}
            </TypoSubtitle>
          }
          productsByCrop={productsByCrop}
          currencyIso={currencyIso}
          handleProductClick={inEditMode ? handleClickAddDiscounts : handleProductLineClicked}
          inEditMode={inEditMode}
          quantityAccessor={quantityAccessor}
          {...(inEditMode
            ? {
                editModeProps: {
                  addProductsProps: {
                    onClick: handleAddProductsClick
                  },
                  editActions: <EditActions />
                }
              }
            : {})}
        />
      </MediaQuery>
      <MediaQuery minWidth={IS_DESKTOP}>
        {!inEditMode ? (
          <ProductListDesktop
            title={title}
            productsByCrop={productsByCrop}
            currencyIso={currencyIso}
            displayProductStatuses={usage === 'order'}
            quantityAccessor={quantityAccessor}
          />
        ) : inEditMode ? (
          <ProductListDesktop
            title={title}
            quantityAccessor={quantityAccessor}
            productsByCrop={productsByCrop}
            currencyIso={currencyIso}
            {...(inEditMode && cart
              ? {
                  editModeProps: {
                    storageLocations: storageLocationsRef.current || [],
                    getMaxQuantity,
                    handleQuantityUpdate,
                    handleProductDelete,
                    handleWarehouseUpdate: handleSelectedLocation,
                    enableDeleteProduct: true,
                    enableWarehouseApplyToAll: true,
                    addProductsProps: {
                      buttonLabel: t('common.add_products.label'),
                      onClick: handleAddProductsClick
                    },
                    editActions: <EditActions />,
                    handleDiscountsClick: handleClickAddDiscounts
                  }
                }
              : {})}
          />
        ) : (
          <Loading label={t('products.loading_products_message.label')} />
        )}
      </MediaQuery>
    </>
  )
}

export const ProductsSection = memo(_ProductsSection, isEqual)
