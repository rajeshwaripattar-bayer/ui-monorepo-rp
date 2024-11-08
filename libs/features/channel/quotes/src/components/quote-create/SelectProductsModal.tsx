import _ from 'lodash'
import styles from './SelectProductsModal.module.scss'
import type React from 'react'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { interpunct, resolutions } from '@gc/constants'
import {
  List,
  FilterChip,
  SortingChip,
  Badge,
  ModalTopBar,
  SearchBarMobile,
  MessageWithAction,
  Loading,
  Table,
  FilterBar,
  type HeaderType,
  Contingency
} from '@gc/components'
import { TypoCaption, TypoSubtitle, TypoOverline } from '@element/react-typography'
import {
  getCurrencyFormat,
  getMatchingCartEntry,
  getMatchingCartEntryIndex,
  getMatchingCartEntryUsingProduct,
  scrollTop
} from '@gc/utils'
import { useLocale, useScreenRes } from '@gc/hooks'
import { useTranslation } from 'react-i18next'
import { Button } from '@element/react-button'
import { TabBar, Tab } from '@element/react-tabs'
import { Divider } from '@element/react-divider'
import {
  useGetProductListQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation
} from '../../store/slices/productsSlice'
import type { Product, Price, Cart, Entry, StorageLocation, DomainDefGcPortalConfig } from '@gc/types'
import { Grid } from '@element/react-grid'
import { type RootState, useAppDispatch } from '../../store'
import { useSelector } from 'react-redux'
import { usePortalConfig } from '@gc/hooks'
import MediaQuery from 'react-responsive'
import { useGetStorageLocationsQuery } from '../../store/slices/configDataSlice'
import { extendedApiSlice as productsApi } from '../../store/slices/productsSlice'
import { Icon } from '@element/react-icon'
import { IconButton } from '@element/react-icon-button'
import { useConvertCartToQuote, useCurrentCart, useSaveEntries, useUpdateCartCache } from '../../hooks/useCurrentCart'
import {
  modifyAppliedAllCartForNewEntries,
  clearProductFilters,
  getProductFilters,
  getProductSearchTerm,
  getProductSelectedCrop,
  getProductSortBy,
  setContingency,
  setNotification,
  setProductFilterOptions,
  setProductFilters,
  setProductSearchTerm,
  setProductSortBy,
  setSelectedProductCrop,
  useDeleteCartEntryMutation
} from '@gc/redux-store'
import { ListItem } from '@element/react-list'
import { store } from '../../store/index'
import { getFasteStoreKey } from '@gc/utils'
import { getQuoteId } from '../../store/selectors/quotesSelector'
import { ProductWithPrice } from '@gc/components/types'
type ProductRow = Product & { quantity: number | undefined; warehouse: { value: string; text: string } | undefined }

const FavoriteIconButton = (props: { val: boolean; productCode: string; selectedCrop: string }) => {
  const dispatch = useAppDispatch()
  const { val, productCode, selectedCrop } = props
  const [addFavorite] = useAddToFavoritesMutation()
  const [removeFavorite] = useRemoveFromFavoritesMutation()
  const [active, setActive] = useState(val)
  const res: number = useScreenRes()
  return (
    <IconButton
      id={productCode}
      active={active}
      iconSize='medium'
      toggleOn={<Icon icon={'favorite'} />}
      toggleOff={<Icon icon={'favorite_border'} />}
      onClick={async () => {
        setActive(!active)
        const updateCachedProducts = () => {
          for (const { originalArgs } of productsApi.util.selectInvalidatedBy(store.getState(), ['Products'])) {
            const originalArgCrop = _.get(originalArgs, 'query.filters.crop')
            if (selectedCrop && originalArgCrop && selectedCrop === originalArgCrop) {
              dispatch(
                productsApi.util.updateQueryData('getProductList', originalArgs, (draft) => {
                  const matching = draft.products.find((p) => p.code === productCode)
                  if (matching) {
                    matching.favorite = !active
                  }
                  return draft
                })
              )
            }
            if (res <= resolutions.M1023) {
              setActive(active) // Important note - this revert is to fix a possible internal toggle caching on EDS side!!
            }
          }
        }
        if (active) {
          await removeFavorite(productCode)
            .unwrap()
            .then(() => {
              updateCachedProducts()
              dispatch(
                setNotification({
                  open: true,
                  message: 'Product removed from favorites.'
                })
              )
            })
            .catch(() => setActive(true))
        } else {
          await addFavorite(productCode)
            .unwrap()
            .then(() => {
              updateCachedProducts()
              dispatch(
                setNotification({
                  open: true,
                  message: 'Product added to favorites.'
                })
              )
            })
            .catch(() => setActive(false))
        }
      }}
    />
  )
}

export interface SelectProductsModalProps {
  setModalProps: (props: { headerActions?: ReactNode; footerActions?: ReactNode }) => void
  openModal: (a: string, options?: { product: Product }) => void
}

export function SelectProductsModal(props: SelectProductsModalProps) {
  const { openModal } = props
  const locale = useLocale()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const portalConfig = usePortalConfig()
  const res = useScreenRes()

  const sortingList = [
    { label: t('common.availability_high_low.label'), columnName: 'available', sortingType: 'desc' },
    { label: t('common.availability_low_high.label'), columnName: 'available', sortingType: 'asc' },
    { label: t('products.name_a-z.label'), columnName: 'name', sortingType: 'asc' },
    { label: t('products.name_z-a.label'), columnName: 'name', sortingType: 'desc' }
  ]
  const cropList: DomainDefGcPortalConfig['cropList'] = portalConfig?.gcPortalConfig?.cropList
  const crops: string[] = portalConfig?.gcPortalConfig?.crops
  const seedYear: string = portalConfig?.gcPortalConfig?.seedYear
  const selectedCrop: string = useSelector(getProductSelectedCrop)
  const [currentTab, setCurrentTab] = useState<number>(
    selectedCrop ? crops.findIndex((crop: string) => crop === selectedCrop) : 0
  )
  const [convertCartToQuote] = useConvertCartToQuote()
  const [openSearch, setOpenSearch] = useState(false)
  const [displayProducts, setDisplayProducts] = useState<Product[]>([])
  const productSearchTerm: string = useSelector(getProductSearchTerm)
  const productSortBy: string = useSelector(getProductSortBy)
  const selectedSortListItem =
    sortingList.find((sl) => {
      const split = productSortBy.split('-')
      return sl.columnName === split[0] && sl.sortingType === split[1]
    }) || sortingList[2]
  const quoteId = useSelector(getQuoteId)
  const filterList = useSelector(getProductFilters)
  const inEditMode = useSelector((state: RootState) => state.quotes.inEditMode)
  const { data: cart, refetch: refetchCart } = useCurrentCart()
  const [expirationDate, setExpirationDate] = useState(new Date())
  const productQueryFilters: { [key: string]: string } = useMemo(
    () => ({
      crop: selectedCrop || crops[0],
      seedYear: seedYear,
      ...(filterList.length > 0 &&
        filterList.reduce((acc: { [key: string]: string }, filter) => {
          if (filter.selectedOptions.length > 0 && filter.filterType !== 'switch') {
            acc[filter.category] = filter.selectedOptions[0]
          }
          return acc
        }, {}))
    }),
    [selectedCrop, filterList, crops, seedYear]
  )
  const searchQuery = useMemo(() => {
    return {
      query: { filters: productQueryFilters, cartId: cart?.code },
      pageSize: portalConfig?.gcPortalConfig.productsPageSize
    }
  }, [cart?.code, portalConfig?.gcPortalConfig.productsPageSize, productQueryFilters])

  const {
    data: result,
    error,
    isLoading,
    isFetching,
    refetch
  } = useGetProductListQuery(searchQuery, { skip: !cart || !cart.code })
  const showOnlyFavorites = !!filterList.find((f) => f.category === 'favorite')?.selectedOptions.length
  const [saveEntries, { isLoading: savingEntries, isError: isErrorSavingEntries }] = useSaveEntries()
  const { data: storageLocations } = useGetStorageLocationsQuery(cart?.warehouse?.code || '', {
    skip: !cart?.warehouse?.code
  })
  const displayWarehouseSelection = !!storageLocations && storageLocations?.length > 1
  const [noOfEntries, setNoOfEntries] = useState(cart?.entries?.filter((e) => !!e.quantity && !e.rejected).length || 0)

  const [deleteEntry] = useDeleteCartEntryMutation()
  const [updateCartCache] = useUpdateCartCache()
  const [showLoader, setShowLoader] = useState(true)
  const [quoteUpdating, setQuoteUpdating] = useState(false)
  const [reviewQuoteClicked, setReviewQuoteClicked] = useState(false)
  const cartRef = useRef<Cart>()
  cartRef.current = cart

  const [headers, setHeaders] = useState<HeaderType<ProductRow>[]>([])
  const getSortedList = useCallback(
    (sortBy: string, products: Product[]) => {
      if (res > resolutions.M1023) {
        return products
      }
      const split = sortBy.split('-')
      return _.orderBy(products, split[0], split[1] as 'asc' | 'desc')
    },
    [res]
  )

  const resetProductSelections = useCallback(() => {
    dispatch(clearProductFilters())
    dispatch(setProductSortBy(''))
    dispatch(setProductSearchTerm(''))
  }, [dispatch])

  const fasteStoreKey = getFasteStoreKey('quotes', 'select-products')

  useEffect(() => {
    // For Mobile/Tablet only
    if (cart?.entries && res <= resolutions.M1023) {
      setNoOfEntries(cart?.entries?.filter((e) => !!e.quantity && !e.rejected).length || 0)
    }
  }, [cart?.entries, res])

  useEffect(() => {
    if (cart?.expirationDate) {
      setExpirationDate(cart?.expirationDate)
    }
    if (productSearchTerm) setOpenSearch(true)
  }, [cart?.expirationDate, productSearchTerm])

  useEffect(() => {
    if (!isLoading && result) {
      let filteredProducts = result.products
      if (showOnlyFavorites) {
        filteredProducts = filteredProducts.filter((p) => p.favorite)
      }
      if (productSearchTerm.trim().length > 0) {
        const searchStr = productSearchTerm.toLowerCase()
        filteredProducts = filteredProducts.filter((row: Product) => row.name.toLowerCase().indexOf(searchStr) > -1)
      }
      setDisplayProducts(
        getSortedList(
          productSortBy ? productSortBy : `${selectedSortListItem.columnName}-${selectedSortListItem.sortingType}`,
          filteredProducts
        )
      )
      if (process.env.NODE_ENV !== 'test') {
        setTimeout(() => setShowLoader(false), 250) // Intentional delay here!!
      } else {
        setShowLoader(false)
      }
    }
    if (error) {
      setShowLoader(false)
    }
  }, [
    result,
    isLoading,
    error,
    productSearchTerm,
    showOnlyFavorites,
    productSortBy,
    getSortedList,
    selectedSortListItem.columnName,
    selectedSortListItem.sortingType
  ])

  useEffect(() => {
    dispatch(
      setProductFilterOptions(result?.facets || [], [
        {
          category: 'favorite',
          title: t('common.favorite.label'),
          switchLabel: t('common.favorites_switch.label'),
          filterType: 'switch',
          options: [t('common.favorite_only_option.label')],
          selectedOptions: []
        }
      ])
    )
  }, [dispatch, result?.facets, t])

  useEffect(() => {
    if (reviewQuoteClicked && !savingEntries) {
      if (isErrorSavingEntries) {
        setReviewQuoteClicked(false)
        setQuoteUpdating(false)
      } else {
        // isCartNotEmpty checks if cart has at least 1 valid entry or latest save bayer entry API call was not failed!!
        const isCartNotEmpty = cart?.entries?.some((e) => _.isNumber(e.entryNumber)) || !isErrorSavingEntries
        if (cart && isCartNotEmpty) {
          setReviewQuoteClicked(false)
          convertCartToQuote({ cartId: cart.code, skipQuotesRefetch: true }, { onFail: () => openModal('EXIT') })
        } else {
          setQuoteUpdating(false)
        }
      }
    }
  }, [cart, convertCartToQuote, isErrorSavingEntries, openModal, reviewQuoteClicked, savingEntries])

  const getUpdatedEntry = (product: Product, qty: number | undefined, storageLocation?: StorageLocation) => {
    const quantity = qty && Number(qty)
    return {
      cropCode: cropList.find((crop) => crop.cropName === product.crop)?.cropCode || '',
      cropName: product.crop,
      product: { code: product.code, name: product.name },
      quantity,
      storageLocation: (storageLocation && { ...storageLocation }) || (storageLocations && { ...storageLocations[0] }),
      totalPricePerUnit: { ...product.price, formattedValue: '', priceType: '' }
    }
  }

  // updateQuantity only gets executed for Desktop
  const updateQuantity = (quantity: string, product: ProductRow, onlyCache = true) => {
    const entriesField = inEditMode ? 'draftEntries' : 'entries'
    const updateEntries = (entries: Entry[]) => {
      const matchingEntry = getMatchingCartEntryUsingProduct(entries, product as unknown as ProductWithPrice, true)
      const entry = getUpdatedEntry(product, Number(quantity), matchingEntry?.storageLocation)
      if (!matchingEntry && Number(quantity) === 0) {
        return undefined
      }
      if (!matchingEntry) {
        entries.push(entry)
      } else {
        matchingEntry.quantity = entry.quantity
      }
      return { ...entry, entryNumber: matchingEntry?.entryNumber }
    }

    updateCartCache((draft: Cart) => {
      draft[entriesField] = draft[entriesField] ?? []
      const entry = updateEntries(draft[entriesField])
      setNoOfEntries(draft[entriesField].filter((e) => !e.rejected && e.quantity && e.quantity > 0).length)

      // onBlur handle
      if (!onlyCache && entry) {
        const deleteEntryFromCartCache = () => {
          updateCartCache((draft: Cart) => {
            const matchingIndex = getMatchingCartEntryIndex(draft.entries, entry, true)
            const { entryNumber, quantity } = draft.entries[matchingIndex]
            if (!_.isNumber(entryNumber) || (_.isNumber(quantity) && quantity === 0)) {
              const entries =
                draft.entries.length > 1
                  ? draft.entries.map((e, index) => {
                      if (index > matchingIndex) {
                        e.entryNumber = e.entryNumber ? e.entryNumber - 1 : e.entryNumber
                      }
                      return e
                    })
                  : [...draft.entries]
              entries.splice(matchingIndex, 1)
              draft.entries = entries
              setNoOfEntries(draft.entries.filter((e) => !e.rejected && e.quantity && e.quantity > 0).length)
            }
            return draft
          })
        }
        if (entry.quantity === 0) {
          if (_.isNumber(entry.entryNumber)) {
            deleteEntry({
              cartId: cart?.code ?? '',
              entryNumber: entry.entryNumber,
              skipCartRefetch: true
            })
              .unwrap()
              .then(() => {
                deleteEntryFromCartCache()
              })
          }
        } else {
          saveEntries(
            {
              cartId: cart?.code ?? '',
              data: {
                orderEntries: [{ ...entry, storageLocationCode: entry.storageLocation?.locationCode }]
              },
              skipCartRefetch: true
            },
            {
              updateCartCache: true,
              contingencyType: 'alert',
              onFail: () => {
                if (_.isNumber(entry.entryNumber)) {
                  // This refetch cart is to revert qty change upon API failure!!
                  refetchCart()
                } else {
                  deleteEntryFromCartCache()
                }
                scrollTop()
              }
            }
          ).then((res) => {
            if (res.isSuccess) {
              // Using cache because cart in this component may not have updated entries as we are not refetching cart after saving entries!!
              updateCartCache((draft: Cart) => {
                if (draft.entries?.length) {
                  setNoOfEntries(draft.entries.filter((e) => !e.rejected && e.quantity && e.quantity > 0).length)
                }
                return draft
              })
              dispatch(setContingency())
            }
          })
        }
      }
      return draft
    })
  }

  const handleSelectedLocation = (location: { value: string; text: string }, product: ProductRow) => {
    const entriesField = inEditMode ? 'draftEntries' : 'entries'
    const updateEntries = (entries: Entry[]) => {
      const matchingEntry = getMatchingCartEntryUsingProduct(entries, product as unknown as ProductWithPrice, true)
      const selectedWarehouse = storageLocations?.find((l) => l.locationCode === location.value)
      const entry = getUpdatedEntry(product, matchingEntry?.quantity, selectedWarehouse)
      if (matchingEntry) {
        matchingEntry.storageLocation = selectedWarehouse
      } else {
        entries.push(entry)
      }
      return { ...entry, entryNumber: matchingEntry?.entryNumber }
    }

    updateCartCache((draft: Cart) => {
      draft[entriesField] = draft[entriesField] ?? []
      const entry = updateEntries(draft[entriesField])
      if (!inEditMode && entry.quantity && entry.quantity > 0) {
        // In editMode we only update draft entries, so not making update API call here.
        saveEntries(
          {
            cartId: cart?.code ?? '',
            data: {
              orderEntries: [{ ...entry, storageLocationCode: entry.storageLocation?.locationCode }]
            }
          },
          { contingencyType: 'alert', onFail: scrollTop }
        ).then((res) => res.isSuccess && dispatch(setContingency()))
      }
      return draft
    })
  }

  const handleFilterChange = useCallback(
    (selectedFilters: { [category: string]: string[] }) => {
      const updatedFilterList = _.cloneDeep(filterList)
      updatedFilterList.forEach((f) => {
        f.selectedOptions = selectedFilters[f.category] || f.selectedOptions
      })
      dispatch(setProductFilters(updatedFilterList))
    },
    [dispatch, filterList]
  )

  const getTableData = useCallback(() => {
    const entries = inEditMode ? cart?.draftEntries : cart?.entries
    const data = displayProducts.map((product: Product) => {
      const matchingCartEntry = getMatchingCartEntryUsingProduct(
        entries,
        product as unknown as ProductWithPrice,
        true
      ) as Entry
      return {
        ...product,
        quantity: matchingCartEntry?.quantity,
        warehouse: matchingCartEntry?.storageLocation
          ? {
              value: matchingCartEntry?.storageLocation.locationCode,
              text: matchingCartEntry?.storageLocation.locationName
            }
          : {
              value: storageLocations?.[0]?.locationCode || '',
              text: storageLocations?.[0]?.locationName || ''
            }
      }
    })
    return data
  }, [inEditMode, cart?.draftEntries, cart?.entries, displayProducts, storageLocations])

  useEffect(() => {
    if (storageLocations?.length) {
      setHeaders([
        {
          header: '',
          editProps: {
            editType: 'custom' as const
          },
          accessor: 'favorite',
          id: 'favorite',
          displayTemplate: (val: boolean, product: ProductRow) => {
            return (
              <FavoriteIconButton
                val={val}
                productCode={product.code}
                selectedCrop={_.get(searchQuery, 'query.filters.crop', '')}
              />
            )
          },
          widthPercentage: 3.5,
          disableSortBy: true
        },
        {
          header: t('common.product_name.label'),
          accessor: 'name',
          id: 'name',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sortType: (x: any, y: any) => {
            const a: string = x.original.name
            const b: string = y.original.name
            return a.localeCompare(b)
          },
          displayTemplate: (_value, product: ProductRow) => {
            const onExclusion = product?.canView === true && product?.canOrder === false
            return (
              <>
                {product.name}&nbsp;
                {!!product.quantity && product.quantity > 0 && <Badge labelText={t('common.added.label')} />}&nbsp;
                {onExclusion && <Badge themeColor='danger' labelText={t('common.on_exclusion.label')} />}
              </>
            )
          },
          widthPercentage: displayWarehouseSelection ? 48 : 64
        },
        ...(displayWarehouseSelection
          ? [
              {
                header: t('common.warehouse.label'),
                accessor: 'warehouse',
                id: 'warehouse',
                editProps: {
                  editType: 'select' as const,
                  selectProps: {
                    onChange: handleSelectedLocation,
                    options: storageLocations.map((location) => ({
                      value: location.locationCode,
                      text: `${location.locationCode} - ${location.locationName}`
                    }))
                  }
                },
                widthPercentage: 16
              }
            ]
          : []),
        {
          header: t('common.retail_price.label'),
          accessor: 'price',
          id: 'price',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sortType: (x: any, y: any) => {
            const a: number = x.original?.price?.value
            const b: number = y.original?.price?.value
            return a - b
          },
          displayTemplate: (_val, { price }: ProductRow) => (
            <TypoCaption>{getCurrencyFormat(price?.currencyIso, price?.value, locale)}</TypoCaption>
          ),
          widthPercentage: 8,
          align: 'right'
        },
        {
          header: t('common.allocation.label'),
          accessor: 'available',
          id: 'available',
          widthPercentage: 8,
          align: 'right'
        },
        {
          header: `${t('common.quantity.label')} (${t('common.ssu.label')})`,
          accessor: 'quantity',
          id: 'ssu-quantity',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sortType: (x: any, y: any) => {
            const a: number = x.original.quantity || 0
            const b: number = y.original.quantity || 0
            return a - b
          },
          editProps: {
            editType: 'textfield' as const,
            textfieldProps: {
              type: 'number',
              isWholeNumber: true,
              placeholder: '0',
              onChange: (quantity, product) => updateQuantity(quantity, product, true),
              onBlur: (quantity, product) => !inEditMode && updateQuantity(quantity, product, false),
              onWheel: (e: React.WheelEvent<HTMLElement>) => {
                e.currentTarget.blur()
              }
            }
          },
          widthPercentage: 8.5
        },
        {
          header: t('common.sub_total.label'),
          accessor: 'quantity',
          id: 'sub_total-quantity',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sortType: (x: any, y: any) => {
            const a: number =
              !!x.original.quantity && x.original.quantity > 0 ? x.original.quantity * x.original.price?.value : 0
            const b: number =
              !!y.original.quantity && y.original.quantity > 0 ? y.original.quantity * y.original.price?.value : 0
            return a - b
          },
          displayTemplate: (_val, product: ProductRow) => (
            <TypoCaption data-testid='subtotal'>
              {getCurrencyFormat(
                product.price?.currencyIso,
                !!product.quantity && product.quantity > 0 ? product.quantity * product.price?.value : 0,
                locale
              )}
            </TypoCaption>
          ),
          widthPercentage: 8,
          align: 'right'
        }
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageLocations, displayWarehouseSelection, getTableData])

  const handleTabActivated = (index: number) => {
    setCurrentTab(index)
    dispatch(setSelectedProductCrop(crops[index]))
    setShowLoader(true)
  }

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setProductSortBy(event.target.value))
    setDisplayProducts(getSortedList(event.target.value, displayProducts))
  }

  const chooseProductQuantity = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (product: any) => {
      openModal('SELECT_QUANTITY', { product })
    },
    [openModal]
  )

  const getStyledListItems = useCallback(
    (products: Array<Product>) => {
      const getProductPrice = (price: Price, uom: string) => {
        return (
          <TypoCaption>
            {getCurrencyFormat(price?.currencyIso, price?.value, locale)}/{uom}
          </TypoCaption>
        )
      }

      const getProductName = (productName: string) => <TypoSubtitle level={2}>{productName}</TypoSubtitle>

      const getProductQuantity = (quantity: number, uom: string) => {
        return (
          <TypoCaption>
            {quantity} {uom} {t('common.available.label')}
          </TypoCaption>
        )
      }

      const items: Array<object> = []
      const entriesField = inEditMode ? 'draftEntries' : 'entries'
      if (products && products.length > 0) {
        products?.forEach((product: Product) => {
          const quantity =
            (!!cart && cart[entriesField]?.find((entry) => entry.product.code === product.code)?.quantity) || 0
          const hasExclusion = product.canOrder === false
          const showOverlineText = quantity > 0 || hasExclusion

          items.push({
            code: product,
            overlineText: showOverlineText && (
              <div className={styles['overline-text-wrapper']}>
                {quantity > 0 && <Badge labelText={t('common.added.label')} />}
                {hasExclusion && <Badge themeColor='danger' labelText={t('common.on_exclusion.label')} />}
              </div>
            ),
            trailingBlockWithAction: (
              <span>
                <FavoriteIconButton
                  val={product.favorite}
                  productCode={product.code}
                  selectedCrop={_.get(searchQuery, 'query.filters.crop', '')}
                />
              </span>
            ),
            primaryText: getProductName(product.name),
            secondaryText: (
              <>
                {getProductPrice(product.price, product.salesUnitOfMeasure)}
                <br />
                {getProductQuantity(product.available, product.salesUnitOfMeasure)}
              </>
            )
          })
        })
      }
      return items
    },
    [cart, inEditMode, locale, searchQuery, t]
  )

  const handleCloseSearch = () => {
    setOpenSearch(false)
    dispatch(setProductSearchTerm(''))
  }

  const handleCancelSearch = () => {
    dispatch(setProductSearchTerm(''))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setProductSearchTerm(e.target.value))
  }

  const getMessageHeader = t(
    error
      ? 'products_api_error_header_msg'
      : result?.products?.length === 0
        ? 'no_products_header_msg'
        : 'common.no_matching_results_message_header_label'
  )

  const getMessageDescription = t(
    error
      ? 'products.api_error_description_msg'
      : result?.products?.length === 0
        ? 'products.no_data_description_msg'
        : 'common.no_results_message_description'
  )

  const getMessageContent = () => {
    const buttonProps = error ? { label: t('common.try_again.label'), variant: 'text', onClick: refetch } : undefined
    return (
      <div className={styles.contingency_container}>
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

  useEffect(() => {
    const draftEntries = cartRef.current?.draftEntries || []
    const addProductsButtonLabel = `${t('common.add.label')} ${
      draftEntries.filter((e) => e.quantity && e.quantity > 0).length || 0
    } ${t('common.product.label', {
      count: draftEntries.length
    })}`
    const addProductsButtonDisabled =
      !draftEntries.length || draftEntries.every((entry) => !entry.quantity || entry.quantity <= 0) || quoteUpdating

    props.setModalProps({
      headerActions: (
        <ModalTopBar
          title={t('common.add_products.label')}
          exitIconButtonProps={{
            icon: inEditMode ? 'close' : 'arrow_back',
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              dispatch(setContingency())
              updateCartCache((draft: Cart) => {
                const cart = _.omit(draft, 'draftEntries')
                cart.expirationDate = expirationDate
                return cart
              })
              resetProductSelections()
              const modalToOpen = inEditMode ? 'EXIT' : 'CREATE_QUOTE'
              props.openModal(modalToOpen)
              e.stopPropagation()
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
                  searchTerm={productSearchTerm}
                  actionProps={{ icon: 'close', onClick: handleCloseSearch }}
                />
              </Grid>
            )
          })}
        />
      ),
      footerActions: inEditMode ? (
        <>
          <Button
            variant='outlined'
            label={t('common.cancel.label')}
            onClick={async () => {
              updateCartCache((draft: Cart) => {
                draft.draftEntries = []
                return draft
              })
              dispatch(setContingency())
              resetProductSelections()
              props.openModal('EXIT')
            }}
            className={styles.cancel_button}
          />
          <Button
            data-testId='add-products-action'
            label={addProductsButtonLabel}
            disabled={addProductsButtonDisabled}
            onClick={async () => {
              setQuoteUpdating(true)

              if (cart) {
                saveEntries(
                  {
                    cartId: cart.code,
                    data: {
                      orderEntries:
                        draftEntries
                          .filter((e) => !!e.quantity)
                          .map((entry) => ({
                            ...entry,
                            storageLocationCode: entry.storageLocation?.locationCode
                          })) || []
                    },
                    updateMethod: 'POST',
                    skipCartRefetch: true
                  },
                  { contingencyType: 'alert' }
                ).then((res) => {
                  if (res.isSuccess) {
                    updateCartCache((draft: Cart) => {
                      const finalEntries = _.cloneDeep(cartRef.current?.entries || [])
                      draftEntries.forEach((entry) => {
                        if (!entry.quantity || entry.quantity <= 0) {
                          return
                        }
                        const existingEntry = getMatchingCartEntry(finalEntries, entry)
                        if (existingEntry) {
                          existingEntry.quantity = (existingEntry.quantity || 0) + entry.quantity
                        } else {
                          finalEntries.push(entry)
                        }
                      })
                      draft.entries = finalEntries
                      return draft
                    })

                    dispatch(setContingency())
                    resetProductSelections()
                    dispatch(
                      modifyAppliedAllCartForNewEntries({
                        cartEntries: cart.entries || [],
                        newEntries: draftEntries,
                        quoteId
                      })
                    )
                    refetchCart()
                    updateCartCache((draft: Cart) => {
                      draft.draftEntries = []
                      return draft
                    })
                    props.openModal('EXIT')
                  }
                })
              }
            }}
          />
        </>
      ) : (
        <Button
          data-testId='review-quote-action'
          fullWidth
          label={`${t('quotes.review_quote.label')}${interpunct}${noOfEntries} ${t('common.product.label', {
            count: noOfEntries
          })}`}
          disabled={quoteUpdating || !cart?.entries?.length || noOfEntries === 0 || isErrorSavingEntries}
          onClick={() => {
            setQuoteUpdating(true)
            setReviewQuoteClicked(true)
          }}
        />
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, openSearch, productSearchTerm, quoteUpdating, savingEntries, noOfEntries])

  const tableData = useMemo(
    () => {
      return getTableData()
    },
    // Do not add getTableData in dependency array as it will re-render the table on every cart change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getTableData]
  )

  const renderProductListsMobile = useCallback(() => {
    const [favorites, otherProducts] = _.partition(displayProducts, (p) => p.favorite)
    return (
      <>
        {favorites.length > 0 && (
          <>
            <ListItem nonInteractive noHover className={styles.products_list_title}>
              <TypoOverline>{t('common.favorites.label').toUpperCase()}</TypoOverline>
            </ListItem>
            <List
              className={styles['product-list-mobile']}
              listItemClassName={styles['product-list-item']}
              items={getStyledListItems(favorites)}
              divider
              onAction={chooseProductQuantity}
            />
          </>
        )}

        {otherProducts.length > 0 && (
          <>
            <ListItem nonInteractive noHover className={styles.products_list_title}>
              <TypoOverline>{t('common.other_products.label')}</TypoOverline>
            </ListItem>
            <List
              className={styles['product-list-mobile']}
              listItemClassName={styles['product-list-item']}
              items={getStyledListItems(displayProducts.filter((p) => !p.favorite))}
              divider
              onAction={chooseProductQuantity}
            />
          </>
        )}
      </>
    )
  }, [chooseProductQuantity, displayProducts, getStyledListItems, t])

  return (
    <div className={styles.container}>
      <Contingency<RootState> codes={['UPDATE_ENTRY_FAILED']} types={['alert']} className={styles.alert_message} />
      <TabBar
        elevated={false}
        variant='surface'
        activeTabIndex={currentTab}
        stacked={false}
        onTabActivated={handleTabActivated}
      >
        {crops.map((tabName: string) => {
          return (
            <Tab clustered={false} indicatorSize='full' indicatorTransition='slide'>
              {tabName.toUpperCase()}
            </Tab>
          )
        })}
      </TabBar>
      <Divider />
      <MediaQuery maxWidth={1023}>
        <div className={styles['filter-container-mobile']}>
          <FilterChip
            leadingIcon='tune'
            filterList={filterList}
            chipLabel='Filters'
            applyFilters={handleFilterChange}
            key='all_filters'
            isAllFilters
            expansionForAllFilters
          />
          <div className={styles['sorting-chip-container']}>
            <SortingChip
              sortingList={sortingList}
              chipLabel={selectedSortListItem.label}
              chipValue={`${selectedSortListItem.columnName}-${selectedSortListItem.sortingType}`}
              handleSortChange={handleSortChange}
              leadingIcon='import_export'
            />
          </div>
        </div>
        {isLoading || showLoader ? (
          <div className={styles.loader}>
            <Loading label={t('products.loading_products_message.label')} />
          </div>
        ) : !displayProducts.length || error ? (
          getMessageContent()
        ) : (
          renderProductListsMobile()
        )}
      </MediaQuery>
      <MediaQuery minWidth={1024}>
        <FilterBar
          filterList={filterList}
          applyFilters={handleFilterChange}
          containerClassName={styles.filter_bar}
          expansionForAllFilters={true}
        />
        {isLoading || isFetching || showLoader ? (
          <div className={styles.loader}>
            <Loading label={t('products.loading_products_message.label')} />
          </div>
        ) : !displayProducts.length || error ? (
          getMessageContent()
        ) : (
          !!headers.length && (
            <Table<ProductRow>
              className={styles.table}
              editable
              paginated
              headers={headers}
              data={tableData}
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
              fasteStoreKey={fasteStoreKey}
            />
          )
        )}
      </MediaQuery>
    </div>
  )
}

export default SelectProductsModal
