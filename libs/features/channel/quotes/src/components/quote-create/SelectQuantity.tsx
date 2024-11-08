import { Button } from '@element/react-button'
import { Icon } from '@element/react-icon'
import { Radio } from '@element/react-radio'
import { Textfield } from '@element/react-textfield'
import { TypoCaption, TypoOverline, TypoSubtitle } from '@element/react-typography'
import { Contingency, List, ModalTopBar } from '@gc/components'
import { interpunct } from '@gc/constants'
import { useLocale, usePortalConfig } from '@gc/hooks'
import { setContingency, setNotification, useDeleteCartEntryMutation } from '@gc/redux-store'
import type { Cart, DomainDefGcPortalConfig, Entry, Price, Product, StorageLocation } from '@gc/types'
import { getCurrencyFormat, getMatchingCartEntryUsingProduct } from '@gc/utils'
import _ from 'lodash'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import styles from './SelectQuantity.module.scss'
// eslint-disable-next-line @nx/enforce-module-boundaries
import cornIcon from '../../../../../../shared/components/src/icons/icon-corn.svg'
// eslint-disable-next-line @nx/enforce-module-boundaries
import sorghumIcon from '../../../../../../shared/components/src/icons/icon-sorghum.svg'
import { ProductWithPrice } from '@gc/components/types'
// eslint-disable-next-line @nx/enforce-module-boundaries
import soyIcon from '../../../../../../shared/components/src/icons/icon-soybeans.svg'
import { useGetStorageLocationsQuery } from '../../store/slices/configDataSlice'
import { RootState, useAppDispatch } from '../../store'
import { getInEditMode } from '../../store/selectors/quotesSelector'
import { useCurrentCart, useSaveEntries, useUpdateCartCache } from '../../hooks/useCurrentCart'

/* eslint-disable-next-line */
export interface SelectQuantityProps {
  product: Product
  setModalProps: (props: { headerActions?: ReactNode; footerActions?: ReactNode }) => void
  openModal: (a: string) => void
}

export function SelectQuantity(props: SelectQuantityProps) {
  const { openModal, setModalProps, product } = props
  const locale = useLocale()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const portalConfig = usePortalConfig()
  const cropList: DomainDefGcPortalConfig['cropList'] = portalConfig?.gcPortalConfig?.cropList
  const [saveEntries] = useSaveEntries()
  const inEditMode = useSelector(getInEditMode)
  const entriesField = inEditMode ? 'draftEntries' : 'entries'

  const [updateCartCache] = useUpdateCartCache()
  const [deleteEntry] = useDeleteCartEntryMutation()
  const { data: cart, refetch: refetchCart } = useCurrentCart()
  const { data: storageLocationsRes } = useGetStorageLocationsQuery(cart?.warehouse?.code || '', {
    skip: !cart?.warehouse?.code
  })

  const [savingProduct, setSavingProduct] = useState(false)
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>()
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | undefined>()
  const [quantity, setQuantity] = useState<string>()
  const [selectedEntry, setSelectedEntry] = useState<Entry>()

  useEffect(() => {
    let _selectedEntry: Entry | undefined
    if (storageLocationsRes && storageLocationsRes.length > 0) {
      if (cart) {
        _selectedEntry = getMatchingCartEntryUsingProduct(
          cart[entriesField],
          product as unknown as ProductWithPrice,
          true
        )
        setSelectedEntry(_selectedEntry)
      }
      setStorageLocations(storageLocationsRes)
      if (!selectedLocation) {
        setSelectedLocation(_selectedEntry?.storageLocation || storageLocationsRes[0])
      }
    }
  }, [cart, entriesField, product, selectedLocation, storageLocationsRes])

  useEffect(() => {
    if (!_.isString(quantity)) {
      setQuantity(selectedEntry?.quantity?.toString())
    }
  }, [selectedEntry, quantity])

  const getPriceValue = useCallback(
    (price: Price, uom: string) => {
      return `${getCurrencyFormat(price?.currencyIso, price?.value, locale)}/${uom}`
    },
    [locale]
  )

  useEffect(() => {
    setModalProps({
      headerActions: (
        <ModalTopBar
          title={t('common.select_quantity.label')}
          exitIconButtonProps={{
            icon: 'arrow_back',
            onClick: () => {
              dispatch(setContingency())
              openModal('SELECT_PRODUCTS')
            }
          }}
        />
      ),
      footerActions: (
        <Button
          fullWidth
          label={`${t('common.add.label')}${interpunct}${getPriceValue(product.price, product.salesUnitOfMeasure)}`}
          disabled={!quantity || savingProduct}
          onClick={async () => {
            setSavingProduct(true)
            const entry = {
              ...(selectedEntry || {}),
              cropCode: cropList.find((crop) => crop.cropName === product.crop)?.cropCode || '',
              cropName: product.crop,
              product: { code: product.code, name: product.name },
              quantity: Number(quantity) || 0,
              storageLocation: selectedLocation,
              storageLocationCode: selectedLocation?.locationCode
            }

            if (inEditMode) {
              updateCartCache((cart: Cart) => {
                cart.draftEntries = cart.draftEntries || []
                const matchingEntryIndex = cart.draftEntries.findIndex((entry) => entry.product.code === product.code)
                if (matchingEntryIndex > -1) {
                  cart.draftEntries[matchingEntryIndex].quantity = Number(quantity)
                  cart.draftEntries[matchingEntryIndex].storageLocation = selectedLocation
                } else {
                  cart.draftEntries.push(entry)
                }
                return cart
              })
              openModal('SELECT_PRODUCTS')
            } else {
              if (selectedEntry || Number(quantity) !== 0) {
                if (Number(quantity) === 0) {
                  if (selectedEntry && _.isNumber(selectedEntry?.entryNumber)) {
                    deleteEntry({
                      cartId: cart?.code ?? '',
                      entryNumber: selectedEntry?.entryNumber
                    }).unwrap()
                  }
                } else {
                  const res = await saveEntries(
                    {
                      cartId: cart?.code ?? '',
                      data: {
                        orderEntries: [entry]
                      }
                    },
                    { contingencyType: 'alert' }
                  )
                  if (res?.isSuccess) {
                    refetchCart() //Force refetching cart, as there is delay in auto refetch (by invalidating tags) in some instances.
                    dispatch(
                      setNotification({
                        open: true,
                        message: `${t('common.product.label')} ${t('common.added_to.label')} ${t('quotes.quote.label')}`
                      })
                    )
                    openModal('SELECT_PRODUCTS')
                  }
                }
              }
            }
          }}
        />
      )
    })
  }, [
    cart?.code,
    cart?.entries,
    cropList,
    deleteEntry,
    dispatch,
    getPriceValue,
    inEditMode,
    openModal,
    product.code,
    product.crop,
    product.name,
    product.price,
    product.salesUnitOfMeasure,
    quantity,
    refetchCart,
    saveEntries,
    savingProduct,
    selectedEntry,
    selectedLocation,
    setModalProps,
    t,
    updateCartCache
  ])

  const getProductPrice = (price: Price, uom: string) => {
    return <TypoCaption>{getPriceValue(price, uom)}</TypoCaption>
  }

  const getProductName = (productName: string) => {
    return <TypoSubtitle level={2}>{productName}</TypoSubtitle>
  }

  const getProductQty = (qty: number, uom: string) => {
    return (
      <TypoCaption>
        {qty} {uom} {t('common.available.label')}
      </TypoCaption>
    )
  }

  const getStyledListItems = (product?: Product) => {
    const items: Array<object> = []
    if (product) {
      items.push({
        code: product.code,
        leadingBlock: (
          <Icon
            variant='filled-secondary'
            className={'lmnt-theme-secondary-200-bg'}
            icon={<img alt='' src={getCropIcon(product.crop)} />}
          />
        ),
        primaryText: getProductName(product.name),
        secondaryText: (
          <>
            {getProductPrice(product.price, product.salesUnitOfMeasure)}
            <br />
            {getProductQty(product.available, product.salesUnitOfMeasure)}
          </>
        )
      })
    }
    return items
  }

  const getCropIcon = (cropName: string) =>
    ({
      Corn: cornIcon,
      Soybeans: soyIcon,
      Sorghum: sorghumIcon
    })[cropName]

  const handleSelectedLocation = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const matchingStorageLocation = storageLocations?.find((s) => s.locationCode === event.target.value)
      if (matchingStorageLocation) {
        setSelectedLocation(matchingStorageLocation)
      }
    },
    [storageLocations]
  )

  const updateQuantity = (event: React.ChangeEvent<HTMLInputElement>) => {
    const qty = event.target.value.replace(/[^0-9]/g, '')
    setQuantity(qty)
  }

  const StorageLocations = useCallback(
    () =>
      storageLocations?.map((item: StorageLocation) => {
        return (
          <div key={item.locationCode}>
            <Radio
              key={`radio-${item.locationCode}`}
              label={item.locationName}
              onChange={handleSelectedLocation}
              value={item.locationCode}
              name='sort'
              checked={item.locationCode === selectedLocation?.locationCode}
            />
          </div>
        )
      }),
    [handleSelectedLocation, selectedLocation?.locationCode, storageLocations]
  )

  return (
    <div className={styles['quantity-container']}>
      <Contingency<RootState> codes={['UPDATE_ENTRY_FAILED']} types={['alert']} className={styles.alert_message} />
      <List leadingBlockType='icon' items={getStyledListItems(product)} noHover />
      <div className={styles['quantity-container']}>
        <Textfield
          variant='outlined'
          dense={true}
          type='number'
          placeholder={t('common.quantity.label')}
          onChange={updateQuantity}
          fullWidth
          autoFocus
          value={quantity}
          className={styles['quantity-text-field']}
        />
      </div>
      {storageLocations && storageLocations.length > 1 && (
        <>
          <TypoOverline className={styles['warehouse-title']}>{t('quote.send_to.label')}</TypoOverline>
          <StorageLocations />
        </>
      )}
    </div>
  )
}

export default SelectQuantity
