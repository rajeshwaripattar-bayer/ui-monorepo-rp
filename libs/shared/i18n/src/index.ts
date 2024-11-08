import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'
import { fetchStore } from '@gc/utils'

let i18nInstance: object | null = null

export const initI18n = (appName: string) => {
  if (!i18nInstance) {
    const gigyaToken = fetchStore('gigyaToken')
    const countryCode = fetchStore('locale').language
    const { translations } = fetchStore('domainDef').hostname
    i18nInstance = i18n
      .use(Backend)
      .use(initReactI18next)
      .init({
        backend: {
          loadPath: `${translations}?apps=${appName}&locales=${countryCode}`,
          customHeaders: {
            authorization: 'Bearer ' + gigyaToken
          },
          parse: function (data: string) {
            const jsonData = JSON.parse(data)
            return jsonData.messages
          }
        },
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false // not needed for react as it escapes by default
        },
        react: {
          useSuspense: true
        }
      })
  }

  return i18nInstance
}
