import { Button } from '@element/react-button'
import { Group } from '@element/react-group'
import { TypoDisplay } from '@element/react-typography'
import { Badge, NestedTable } from '@gc/components'
import { StockOrderProduct, StockOrderProductsByCrop } from '@gc/components/types'
import { usePortalConfig } from '@gc/hooks'
import { getFasteStoreKey } from '@gc/utils'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import cornIcon from '../../../src/icons/icon-corn.svg'
import sorghumIcon from '../../../src/icons/icon-sorghum.svg'
import soyIcon from '../../../src/icons/icon-soybeans.svg'
import { HeaderType } from '../../ui-common/table/Table'
import ProductListHeader from './ProductListHeader'
import styles from './StockOrderProductListDesktop.module.scss'

/* eslint-disable-next-line */
export interface StockOrderProductListDesktopProps {
  orderStatus: string
  productListByCrop: StockOrderProductsByCrop[]
  noMatchingDataContingency?: React.ReactNode
  handleAddProductsClick?: () => void
  handleEdit?: () => void
}

export function StockOrderProductListDesktop({
  orderStatus,
  productListByCrop,
  noMatchingDataContingency,
  handleAddProductsClick,
  handleEdit
}: StockOrderProductListDesktopProps) {
  const portalConfig = usePortalConfig()
  const { t } = useTranslation()
  const fasteStoreKey = getFasteStoreKey('orders', 'stockOrderProductList')

  const getHeaders = useCallback(
    (): HeaderType<StockOrderProduct>[] => [
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
        widthPercentage: 45,
        displayTemplate: (_value: string, product: StockOrderProduct) => (
          <>
            {product.name}&nbsp;
            {product.unconfirmedQuantity > 0 && <Badge themeColor='orange' labelText={t('common.unconfirmed.label')} />}
          </>
        ),
        searchable: true
      },
      {
        align: 'start',
        widthPercentage: 25,
        accessor: 'warehouse.text',
        header: t('common.warehouse.label'),
        searchable: true
      },
      {
        align: 'end',
        widthPercentage: 10,
        accessor: 'quantity',
        header: `${t('common.quantity.label')} (${t('common.ssu.label')})`,
        searchable: true
      },
      {
        align: 'end',
        widthPercentage: 10,
        accessor: 'confirmedQuantity',
        header: t('common.confirmed.label'),
        searchable: true
      },
      {
        align: 'end',
        widthPercentage: 10,
        accessor: 'unconfirmedQuantity',
        header: t('common.unconfirmed.label'),
        searchable: true
      }
    ],
    [t]
  )

  const getCropIcon = useCallback(
    (cropName: string) =>
      ({
        Corn: cornIcon,
        Soybean: soyIcon,
        Soybeans: soyIcon,
        Sorghum: sorghumIcon
      }[cropName]),
    []
  )

  const title = useMemo(() => {
    return (
      <div className={styles.title}>
        <TypoDisplay level={6}>{`${portalConfig?.gcPortalConfig?.seedYear} Stock Order`}</TypoDisplay>
        <Badge labelText={orderStatus} />
      </div>
    )
  }, [portalConfig?.gcPortalConfig?.seedYear, t])

  const EditButton = useCallback(
    () => (
      <Button
        key='edit'
        variant='outlined'
        label={t('common.edit.label')}
        buttonSize='medium'
        onClick={() => handleEdit?.()}
      />
    ),
    [handleEdit]
  )

  const AddProductsButton = useCallback(
    () => (
      <Button
        key='add_products'
        variant='outlined'
        leadingIcon='add'
        label={t('common.add_products.label')}
        buttonSize='medium'
        onClick={() => handleAddProductsClick?.()}
      />
    ),
    [handleAddProductsClick]
  )

  return (
    <NestedTable<StockOrderProduct, StockOrderProductsByCrop>
      title={title}
      data={productListByCrop.map((item) => ({ rows: item.products, tableData: item }))}
      headers={getHeaders()}
      tableTopBar={(data) => (
        <ProductListHeader
          icon={<img alt='' src={getCropIcon(data.tableData.crop)} />}
          crop={data.tableData.crop}
          count={data.tableData.products.length}
        />
      )}
      tableProps={{
        layout: 'block',
        noHover: true,
        className: styles.table,
        style: { border: 'none', maxWidth: '100%' },
        fasteStoreKey: fasteStoreKey
      }}
      searchable
      noMatchingDataContingency={noMatchingDataContingency}
      trailingTopBarSlot={
        <Group gap='dense' direction='horizontal' secondaryAlign='center'>
          <AddProductsButton />
          <EditButton />
        </Group>
      }
    />
  )
}

export default StockOrderProductListDesktop
