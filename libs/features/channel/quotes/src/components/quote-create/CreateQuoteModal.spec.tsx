import * as reduxStore from '@gc/redux-store'
import { act, actAwait, fireEvent, render } from '@gc/utils'
import { http, HttpResponse } from 'msw'
import { MemoryRouter as Router } from 'react-router-dom'
import { setUpStore } from '../../store'
import { TestModal } from '../mocks/TestModal'
import { newCart } from '../mocks/cart'
import server from '../mocks/server'
import CreateQuoteModal from './CreateQuoteModal'

const mockUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUsedNavigate
}))

const mockPortalConfig = {
  gcPortalConfig: {
    crops: ['Corn', 'Soybeans'],
    cropList: [
      { cropCode: 'seed_corn', cropName: 'Corn' },
      { cropCode: 'seed_soybean', cropName: 'Soybeans' }
    ],
    orderConfig: {
      salesYear: 2024,
      salesOrgId: '1234567890',
      brand: 'Test Brand'
    },
    discounts: {
      nonDiscretionaryDiscount: {
        defaultPrepay: 'Prepay'
      }
    },
    expirationDateOptions: [
      {
        timePeriod: '1',
        duration: '1',
        expirationDate: '2024-09-01T07:00:00-05:00'
      }
    ]
  }
}

jest.mock('@gc/hooks', () => ({
  ...jest.requireActual('@gc/hooks'),
  useUser: () => ({
    username: 'test@test.com',
    name: 'Test User'
  }),
  usePortalConfig: () => {
    return mockPortalConfig
  },
  useLocale: () => ({ code: 'en-US', country: 'US', language: 'en' }),
  useScreenRes: () => 5,
  useSelectedAccount: () => ({ sapAccountId: '1234567890' })
}))

describe('CreateQuoteModal', () => {
  describe('CreateQuoteModal Desktop', () => {
    beforeEach(() => {
      // track network requests for each test
      jest.clearAllMocks()
    })
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())

    it('should display loading when bayer programs API is not available', async () => {
      const { getByText } = render(<CreateQuoteModal setModalProps={jest.fn()} openModal={jest.fn()} />, {
        store: setUpStore()
      })
      expect(getByText('common.loading_discounts.label')).toBeDefined()
    })

    it('should display appropriate message when bayer programs API is not available', async () => {
      server.use(http.get(/bayer-program/, () => HttpResponse.error()))
      const { getByText, getByRole } = render(<CreateQuoteModal setModalProps={jest.fn()} openModal={jest.fn()} />, {
        store: setUpStore()
      })
      await actAwait(1000)
      expect(getByText('common.data_load_failed.label')).toBeDefined()
      expect(getByRole('button', { name: 'common.try_again.label' })).toBeDefined()
    })

    it('should set appropriate contingency when quote creation fails', async () => {
      const mockOpenModal = jest.fn()
      const cartWithEntries = {
        ...newCart,
        entries: [{ entryNumber: 1, product: { code: '123' }, quantity: 1, storageLocationCode: 'SL1' }]
      }
      const setContingencySpy = jest.spyOn(reduxStore, 'setContingency')
      server.use(http.get(/carts/, () => HttpResponse.json(cartWithEntries)))
      server.use(
        http.post(/\/quotes/, () => {
          return new HttpResponse(null, {
            status: 400,
            statusText: 'Bad Request'
          })
        })
      )
      const { getByTestId } = render(
        <Router>
          <TestModal modalBody={CreateQuoteModal} openModal={mockOpenModal} />
        </Router>,
        { store: setUpStore() }
      )
      await actAwait(1000)
      await act(async () => fireEvent.click(getByTestId('review-quote-action')))
      expect(setContingencySpy).toHaveBeenCalledWith({
        code: 'CONVERT_CART_TO_QUOTE_FAILED',
        dialogProps: {
          actionButtonProps: { label: 'common.try_again.label', onAction: expect.any(Function) },
          message: 'common.refresh_page_to_fix.description',
          open: true,
          title: 'quotes.create_failed.label'
        },
        displayType: 'dialog',
        onDismissAction: expect.any(Function)
      })
    })
  })
})
