import '@testing-library/jest-dom'
import 'whatwg-fetch'

// This is to fix Element Modal focus trap error during unit tests.
window.Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue({ height: 1, width: 1 })

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {})
      }
    }
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => {}
  }
}))

// Mock scrollTo to prevent error in console
window.scrollTo = jest.fn()
