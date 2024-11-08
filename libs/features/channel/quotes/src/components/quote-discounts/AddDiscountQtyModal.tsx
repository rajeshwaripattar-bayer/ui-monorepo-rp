import styles from './AddDiscountQtyModal.module.scss'
import { ModalTopBar, SegmentButton, ProductHeader, RecommendedRange as RecommendedRangeLabel } from '@gc/components'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@element/react-button'
import { useTranslation } from 'react-i18next'
import type { Entry, Product, RecommendedRange, ProductLevelRange, Strategy, OrderConfig } from '@gc/types'
import { TypoOverline, TypoCaption } from '@element/react-typography'
import { Switch } from '@element/react-switch'
import { Textfield } from '@element/react-textfield'
import { getConvertedValue, getDecimalValue } from '@gc/utils'
import { useLocale, useScreenRes, useSelectedAccount, usePortalConfig } from '@gc/hooks'
import { resolutions } from '@gc/constants'
import { useAppDispatch } from '../../store'
import { useCurrentCart, useGetRecommendedRange } from '../../hooks/useCurrentCart'
import { useGetDiscretionaryBudgetsQuery } from '../../store/slices/discountsSlice'
import { updateDiscretionaryDiscounts } from '@gc/redux-store'
import { setNotification } from '@gc/redux-store'
import type { ProductWithPrice, QuantityUpdateRequest } from '@gc/components/types'
import _ from 'lodash'
import { useSelector } from 'react-redux'
import { getQuoteId } from '../../store/selectors/quotesSelector'

export interface AddDiscountQtyModalProps {
  programName: string
  setModalProps: (props: { headerActions?: ReactNode; footerActions?: ReactNode; entry?: Entry }) => void
  openModal: (
    a: string,
    options?: {
      product?: Product
      entry?: Entry
      updatedStrategy?: Strategy
      programName?: string
      handleQuantityUpdate?: (request: QuantityUpdateRequest) => Promise<{
        isSuccess: boolean
      } | null>
      productWithPrice: ProductWithPrice
    }
  ) => void
  entry: Entry
  strategies: Strategy[]
  handleQuantityUpdate?: (request: QuantityUpdateRequest) => Promise<{
    isSuccess: boolean
  } | null>
  productWithPrice: ProductWithPrice
}

export function AddDiscountQtyModal(props: AddDiscountQtyModalProps) {
  const { programName, setModalProps, openModal, entry, handleQuantityUpdate, productWithPrice } = props
  const quoteId = useSelector(getQuoteId)
  const {
    data: recommendedRange,
    isError: isRecommendedRangeFailed,
    isLoading: recommendedRangeLoading
  } = useGetRecommendedRange()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const locale = useLocale()
  const res = useScreenRes()
  const isSmallMobile = res <= resolutions.M719
  const portalConfig = usePortalConfig()
  const orderConfig: OrderConfig = portalConfig?.gcPortalConfig?.orderConfig
  const { data: cart } = useCurrentCart()
  const { data: discretionaryBudgets } = useGetDiscretionaryBudgetsQuery(
    {
      salesYear: orderConfig.salesYear,
      salesOrgId: orderConfig.salesOrgId,
      brand: portalConfig.gcPortalConfig.brandFamily,
      accountDealerSAPId: useSelectedAccount().sapAccountId,
      accountGrowerSAPId: cart?.grower || ''
    },
    {
      skip: _.isEmpty(cart)
    }
  )
  const propsDiscount = useMemo(() => props.strategies[0].displayDiscount, [props.strategies])
  const [discountRate, setDiscountRate] = useState<string>(
    propsDiscount === 0 ? '' : getDecimalValue(propsDiscount.toString(), 2)
  )
  const [strategy, setStrategy] = useState<Strategy>(props.strategies[0])
  const discountNotPresent = useMemo(
    () => strategy.displayDiscount === 0 && discountRate === '',
    [discountRate, strategy.displayDiscount]
  )

  const handleApplyAllChange = (val: boolean) => {
    setStrategy({ ...strategy, applyToAll: val })
  }

  const handleDiscountUnitChange = (val: string) => {
    const updatedStrategy = {
      ...strategy,
      discountUnit: val
    }
    if (val === '%') {
      updatedStrategy.discountPercentage = updatedStrategy.displayDiscount
    } else {
      updatedStrategy.discountValue = updatedStrategy.displayDiscount
    }
    setStrategy(updatedStrategy)
  }

  const handleDiscountRateBlur = () => {
    setDiscountRate(getDecimalValue(discountRate, 2))
  }

  const handleApplyDiscountClick = useCallback(() => {
    let _strategy = strategy
    setDiscountRate(getDecimalValue(discountRate, 2))
    const _discountRate = Number.parseFloat(discountRate)
    if (_discountRate !== props.strategies[0].displayDiscount) {
      _strategy = {
        ...strategy,
        displayDiscount: _discountRate,
        discountValue:
          strategy.discountUnit !== '%'
            ? _discountRate
            : getConvertedValue(_discountRate, '%', entry?.totalPricePerUnit?.value || 1),
        discountPercentage:
          strategy.discountUnit === '%'
            ? _discountRate
            : getConvertedValue(_discountRate, '$', entry?.totalPricePerUnit?.value || 1)
      }
    }
    dispatch(updateDiscretionaryDiscounts(cart, discretionaryBudgets, entry, programName, _strategy, quoteId))
    dispatch(
      setNotification({
        open: true,
        message: t('common.discount_updated.label')
      })
    )
    openModal('ADD_DISCOUNTS', { entry, productWithPrice, handleQuantityUpdate })
  }, [
    cart,
    discountRate,
    discretionaryBudgets,
    dispatch,
    entry,
    handleQuantityUpdate,
    openModal,
    productWithPrice,
    programName,
    props.strategies,
    quoteId,
    strategy,
    t
  ])

  const applyDiscountAction = useMemo(
    () => (
      <Button
        label={t('common.add_discount.label')}
        fullWidth={isSmallMobile}
        disabled={discountNotPresent}
        onClick={handleApplyDiscountClick}
      />
    ),
    [t, isSmallMobile, discountNotPresent, handleApplyDiscountClick]
  )

  const removeDiscountAction = useMemo(
    () => (
      <Button
        variant='outlined'
        themeColor='danger'
        className={styles.remove_discount_button}
        fullWidth={isSmallMobile}
        label='Remove'
        disabled={discountNotPresent}
        onClick={() => {
          if (props.strategies[0].displayDiscount !== 0) {
            dispatch(
              updateDiscretionaryDiscounts(
                cart,
                discretionaryBudgets,
                entry,
                programName,
                {
                  ...strategy,
                  displayDiscount: 0
                },
                quoteId
              )
            )
            dispatch(
              setNotification({
                open: true,
                message: t('common.discount_removed.label')
              })
            )
          }
          openModal('ADD_DISCOUNTS', { entry, productWithPrice, handleQuantityUpdate })
        }}
      />
    ),
    [
      isSmallMobile,
      discountNotPresent,
      props.strategies,
      openModal,
      entry,
      productWithPrice,
      handleQuantityUpdate,
      dispatch,
      cart,
      discretionaryBudgets,
      programName,
      quoteId,
      strategy,
      t
    ]
  )
  const footerActions = useMemo(
    () => [removeDiscountAction, applyDiscountAction],
    [applyDiscountAction, removeDiscountAction]
  )

  useEffect(() => {
    setModalProps({
      headerActions: (
        <ModalTopBar
          title={strategy.name}
          exitIconButtonProps={{
            icon: 'arrow_back',
            onClick: () => {
              openModal('ADD_DISCOUNTS', { entry, productWithPrice, handleQuantityUpdate })
            }
          }}
        />
      ),
      footerActions: <div>{footerActions}</div>
    })
  }, [
    setModalProps,
    openModal,
    strategy,
    entry,
    programName,
    t,
    locale,
    dispatch,
    cart,
    discretionaryBudgets,
    isSmallMobile,
    applyDiscountAction,
    removeDiscountAction,
    footerActions,
    handleQuantityUpdate,
    productWithPrice
  ])

  const productRecDiscount = useCallback(() => {
    if (recommendedRangeLoading) return // This will show loader
    if (isRecommendedRangeFailed) return ''
    if (recommendedRange?.length) {
      const cropLevelData = recommendedRange?.filter(
        (row: RecommendedRange) => row.cropName === entry.cropName?.toLowerCase()
      )
      if (cropLevelData.length) {
        const ProductLevelRange = cropLevelData[0].productLevelRange.filter(
          (row: ProductLevelRange) => row.Product === entry.product.acronymID
        )
        if (ProductLevelRange.length > 0) {
          return strategy.discountUnit === '%' ? ProductLevelRange[0].RecDiscountPCT : ProductLevelRange[0].RecDiscount
        }
      }
    }
    return ''
  }, [
    entry.cropName,
    entry.product.acronymID,
    isRecommendedRangeFailed,
    recommendedRange,
    recommendedRangeLoading,
    strategy.discountUnit
  ])

  return (
    <div className={styles.container}>
      {entry && (
        <ProductHeader
          entry={entry}
          unitOfMeasure={'unit'}
          minDiscount={0}
          maxDiscount={0}
          showRecommendedRange={false}
        />
      )}
      <div className={styles.discount_rate}>
        <TypoOverline>{t('common.discount_rate.label')}</TypoOverline>
        <br />
        <RecommendedRangeLabel
          recommendedRange={productRecDiscount()}
          uom='unit'
          recommendedRangeLabel={t('discounts.recommended_range')}
        />
      </div>
      <div className={styles.discount_qty_wrapper}>
        <span className={styles.left}>
          <Textfield
            type='number'
            placeholder='0.00'
            value={discountRate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              let value = e.target.value
              const decimalIndex = value.indexOf('.')
              if (decimalIndex !== -1 && value.substring(decimalIndex + 1).length > 2) {
                value = value.slice(0, decimalIndex + 3)
              }
              setDiscountRate(Number(value) < 0 || value === '' ? '' : value)
            }}
            onBlur={handleDiscountRateBlur}
            fullWidth
            variant='outlined'
            dense
          />
        </span>
        <SegmentButton
          buttonProps={{ buttonSize: 'xsmall' }}
          data={[
            { name: '%', value: '%' },
            { name: '$', value: 'USD' }
          ]}
          selectedValue={strategy.discountUnit}
          onClick={handleDiscountUnitChange}
        />
      </div>

      <div className={styles.discount_qty_wrapper}>
        <span className={styles.left}>
          <TypoOverline> {t('common.apply_to_all.label')} </TypoOverline>
        </span>
        <Switch
          checked={strategy.applyToAll}
          label={''}
          themeColor={'primary'}
          onChange={handleApplyAllChange}
          data-testid='apply-all-switch'
          disabled={discountNotPresent}
        />
      </div>
      <div className={styles.discount_rate}>
        <span className={styles.left}>
          <TypoCaption>{t('quotes.discount_apply_all_desc').replace('$CROP', entry?.cropName || 'Crop')}</TypoCaption>
        </span>
      </div>
    </div>
  )
}

export default AddDiscountQtyModal
