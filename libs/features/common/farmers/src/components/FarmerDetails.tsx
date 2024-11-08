import { Divider } from '@element/react-divider'
import { Grid, GridCol, GridRow } from '@element/react-grid'
import { TypoCaption, TypoDisplay } from '@element/react-typography'
import { FarmerDetails as FarmerDetailsType, LabelValueConfig } from '@gc/types'
import chunk from 'lodash/chunk'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './FarmerDetails.module.scss'

const FARMER_DETAILS_PER_ROW = 3

type FarmerDetails = {
  data: FarmerDetailsType
  fields: LabelValueConfig[]
}

export const FarmerDetails = ({ data, fields }: FarmerDetails) => {
  const farmerDetailFieldChunks = chunk(fields, FARMER_DETAILS_PER_ROW)
  const { t } = useTranslation()
  return (
    <Grid className={styles.farmerDetailsContainer}>
      <Divider variant={'dense'} style={{ width: '100%' }} />
      {farmerDetailFieldChunks.map((farmerDetailFieldChunk, i, { length }) => {
        const isLastRow = i === length - 1
        return (
          <Fragment key={`${farmerDetailFieldChunk[0].displayName}Row`}>
            <GridRow>
              {farmerDetailFieldChunk.map((field) => (
                <GridCol desktopCol={4} key={field.displayName} className={styles.farmerInfoCard}>
                  <TypoCaption>{t(`farmers.farmerDetails.list.${field.displayName}`)?.toUpperCase()}</TypoCaption>
                  <TypoDisplay level={6}>
                    {data[field.displayValue as keyof Omit<FarmerDetailsType, 'cropZones'>]}
                  </TypoDisplay>
                </GridCol>
              ))}
            </GridRow>
            {!isLastRow && <Divider variant={'dense'} style={{ width: '100%' }} />}
          </Fragment>
        )
      })}
    </Grid>
  )
}

export default FarmerDetails
