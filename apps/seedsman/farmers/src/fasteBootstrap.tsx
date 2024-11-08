import { setupStore } from '@gc/features-common-farmers'
import { getFasteModule } from '@gc/shared/faste-app-starter'
import { initI18n } from '@gc/shared/i18n'
import React, { StrictMode } from 'react'
import { Provider } from 'react-redux'

import App from './app/app'

const FASTE = getFasteModule((moduleProps) => {
  import('nbmWidget/initModule').then((initModule) => {
    initModule.initFasteStore(moduleProps.fasteStore)
  })

  initI18n('c7-farmers')

  return (
    <StrictMode>
      <Provider store={setupStore()}>
        <App />
      </Provider>
    </StrictMode>
  )
})
export default FASTE
