import { Button } from '@element/react-button'
import { Icon } from '@element/react-icon'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

type BackButtonProps = {
  className?: string
}

export const BackButton = ({ className }: BackButtonProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleBack = () => {
    navigate(document.referrer?.includes('climate.com') ? -4 : -1)
  }

  return (
    <Button className={className} variant='text' onClick={handleBack}>
      <Icon icon='arrow_back' iconSize='small' style={{ verticalAlign: 'text-bottom', marginRight: 4 }}></Icon>
      {t('global.back')}
    </Button>
  )
}

export default BackButton
