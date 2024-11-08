import { setupStore } from '@gc/features-common-farmers'
import { getFasteModule } from '@gc/shared/faste-app-starter'
import { initI18n } from '@gc/shared/i18n'
import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { initAzureClient } from '@gc/api/client'

import App from './app/app'

const FASTE = getFasteModule((moduleProps) => {
  const { route } = moduleProps
  initI18n('global-commerce')
  initAzureClient()

  return (
    <StrictMode>
      <Provider store={setupStore()}>
        <App base={route.path} />
      </Provider>
    </StrictMode>
  )
})
export default FASTE
