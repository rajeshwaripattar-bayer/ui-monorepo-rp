import { TypoCaption } from '@element/react-typography'
import { useFarmersModuleConfig, useSelectedAccount } from '@gc/hooks'
import React from 'react'

import styles from './MyView.module.scss'

export const MyView = () => {
  const { accountName, lob } = useSelectedAccount()
  const { myView = {} } = useFarmersModuleConfig()

  return (
    <div className={styles.myViewContainer}>
      <div
        className={styles.imageBackground}
        style={{
          backgroundImage: `url(${myView[lob.toUpperCase()]?.backgroundImage})`
        }}
      >
        <div className={styles.inner}>
          <svg style={{ height: '2.25rem' }}>
            <image style={{ height: '100%' }} xlinkHref={myView[lob.toUpperCase()]?.logo} />
          </svg>
          <div style={{ display: 'flex', columnGap: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <TypoCaption bold>Line of Business</TypoCaption>
              <TypoCaption>{myView[lob.toUpperCase()]?.lobDisplayName}</TypoCaption>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <TypoCaption bold>Location</TypoCaption>
              <TypoCaption>{accountName}</TypoCaption>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default MyView
