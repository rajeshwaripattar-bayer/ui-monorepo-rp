import { Button } from '@element/react-button'
import { Icon } from '@element/react-icon'
import { TypoBody, TypoDisplay } from '@element/react-typography'
import { useTranslation } from 'react-i18next'

import styles from './TableMessage.module.scss'

type TableErrorMessageProps = {
  refetch: () => void
}

const TableErrorMessage = ({ refetch }: TableErrorMessageProps) => {
  const { t } = useTranslation()
  return (
    <div>
      <Icon icon='sync_problem' />
      <TypoDisplay level={6}>{t('global.errors.tryAgainMessage')}</TypoDisplay>
      <TypoBody level={2}>{t('global.errors.tryAgainDescription')}</TypoBody>
      <Button onClick={refetch} themeColor='secondary'>
        {t('global.errors.tryAgain')}
      </Button>
    </div>
  )
}

const TableNoDataMessage = () => {
  const { t } = useTranslation()
  return (
    <div>
      <Icon icon='warning' />
      <TypoDisplay level={6}>{t('global.errors.dataUnavailable')}</TypoDisplay>
      <TypoBody level={2}>{t('global.errors.noData')}</TypoBody>
    </div>
  )
}

type TableMessageProps = {
  loading: boolean
  error: boolean
  refetch: () => void
}

export const TableMessage = ({ loading, error, refetch }: TableMessageProps) => {
  if (loading) return false
  if (error) {
    return (
      <div className={styles.tableMessageContainer}>
        <TableErrorMessage refetch={refetch} />
      </div>
    )
  }
  return (
    <div className={styles.tableMessageContainer}>
      <TableNoDataMessage />
    </div>
  )
}

export default TableMessage
