import { Radio } from '@element/react-radio'
import { TypoOverline } from '@element/react-typography'
import type { StorageLocation } from '@gc/types'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrentCart } from '../../hooks/useCurrentCart'
import { useGetStorageLocationsQuery } from '../../store/slices/configDataSlice'
import styles from './SelectStorageLocation.module.scss'

export interface SelectStorageLocationProps {
  location?: { value: string; text: string }
  handleStorageLocationUpdate: (location: { value: string; text: string }) => void
}

export function SelectStorageLocation({ location, handleStorageLocationUpdate }: Readonly<SelectStorageLocationProps>) {
  const { t } = useTranslation()

  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>()
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | undefined>()

  const { data: cart } = useCurrentCart()
  const { data: storageLocationsRes } = useGetStorageLocationsQuery(cart?.warehouse?.code || '', {
    skip: !cart?.warehouse?.code
  })

  useEffect(() => {
    if (storageLocationsRes && storageLocationsRes.length > 0) {
      setStorageLocations(storageLocationsRes)
      const locations = storageLocationsRes.filter((loc) => loc.locationCode === location?.value)
      if (!selectedLocation) {
        setSelectedLocation(locations[0] || storageLocationsRes[0])
      }
    }
  }, [storageLocationsRes, selectedLocation, location?.value])

  const handleSelectedLocation = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const matchingStorageLocation = storageLocations?.find((s) => s.locationCode === event.target.value)
      if (matchingStorageLocation) {
        setSelectedLocation(matchingStorageLocation)
        handleStorageLocationUpdate({
          value: matchingStorageLocation.locationCode,
          text: matchingStorageLocation.locationName
        })
      }
    },
    [storageLocations, handleStorageLocationUpdate]
  )

  return (
    <div className={styles.container}>
      {storageLocations && storageLocations.length > 1 && (
        <>
          <TypoOverline>{t('quote.send_to.label')}</TypoOverline>
          {storageLocations?.map((item: StorageLocation) => {
            return (
              <div key={item.locationCode}>
                <Radio
                  name='sort'
                  value={item.locationCode}
                  key={`radio-${item.locationCode}`}
                  label={`${item.locationCode} - ${item.locationName}`}
                  checked={item.locationCode === selectedLocation?.locationCode}
                  onChange={handleSelectedLocation}
                />
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default SelectStorageLocation
