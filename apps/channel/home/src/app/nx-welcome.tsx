import { Typography } from '@element/react-typography'
import { Padding } from '@element/react-padding'
import { useTranslation } from 'react-i18next'

export function NxWelcome({ title }: { title: string }) {
  const { t } = useTranslation()
  return (
    <Padding variant='airy'>
      <Typography type='display5'>Welcome to {title}</Typography>
      <br />
      <Typography type='display5'>Translation: {t('store.welcome.headline')}</Typography>
    </Padding>
  )
}

export default NxWelcome
