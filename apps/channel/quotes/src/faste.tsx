import { initAzureClient } from '@gc/api/client'
import { store } from '@gc/features-channel-quotes'
import { getFasteModule } from '@gc/shared/faste-app-starter'
import { initI18n } from '@gc/shared/i18n'
import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import App from './app/app'

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
