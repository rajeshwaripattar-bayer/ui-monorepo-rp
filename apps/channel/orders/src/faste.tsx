import { StrictMode } from 'react'
import App from './app/app'
import { Provider } from 'react-redux'
import { getFasteModule } from '@gc/shared/faste-app-starter'
import { initAzureClient } from '@gc/api/client'
import { initI18n } from '@gc/shared/i18n'
import { store } from '@gc/features-channel-orders'

const FASTE = getFasteModule((moduleProps) => {
  // this getFasteModule returns mount function
  const { route } = moduleProps

  initI18n('global-commerce')
  initAzureClient()

  return (
    <StrictMode>
      <Provider store={store}>
        <App base={route.path} />
      </Provider>
    </StrictMode>
  )
})
export default FASTE
