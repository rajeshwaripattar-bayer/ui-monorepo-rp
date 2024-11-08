import styles from './FlagLabel.module.scss'
import React from 'react'
import { TypoBody } from '@element/react-typography'
import { useTranslation } from 'react-i18next'
import { Flag } from './Flag'

export function FlagLabel() {
  const { t } = useTranslation()
  return (
    <div className={styles.container}>
      <Flag className={styles.flag} />
      <TypoBody level={2}>{t('common.flag.label')}</TypoBody>
    </div>
  )
}

export default FlagLabel
