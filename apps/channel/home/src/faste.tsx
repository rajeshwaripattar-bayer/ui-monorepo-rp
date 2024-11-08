import App from './app/app'
import { getFasteModule } from '@gc/shared/faste-app-starter'
import { initAzureClient } from '@gc/api/client'
import { initI18n } from '@gc/shared/i18n'

const FASTE = getFasteModule((moduleProps) => {
  // this getFasteModule returns mount function
  const { route } = moduleProps

  initI18n('global-commerce')
  initAzureClient()

  return <App base={route.path} />
})

export default FASTE
