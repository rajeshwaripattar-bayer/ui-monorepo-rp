import { actAwait, render, screen } from '@gc/utils'
import { setUpStore } from '../../store'

import { http, HttpResponse } from 'msw'
import server from '../mocks/server'
import QuoteDetails from './QuoteDetails'

jest.mock('react-router-dom', () => ({
  useNavigate: () => () => ({}),
  useLocation: () => () => ({}),
  useParams: () => ({ code: '123' })
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
    expirationDateOptions: [
      {
        timePeriod: 'days',
        duration: 1,
        description: 'quotes.expiration_current_expiration_date.label'
      }
    ]
  },
  quotesModule: {
    quoteActions: ['edit', 'duplicate', 'convertToOrder', 'shareWithFarmer', 'print', 'delete']
  }
}
jest.mock('@gc/hooks', () => {
  return {
    ...jest.requireActual('@gc/hooks'),
    useGcPortalConfig: () => {
      return mockPortalConfig.gcPortalConfig
    },
    usePortalConfig: () => {
      return mockPortalConfig
    },
    useUser: () => ({
      username: 'test@test.com',
      name: 'Test User'
    }),
    useLocale: () => ({ code: 'en-US', country: 'US', language: 'en' }),
    useScreenRes: () => 5,
    useUpdateFasteStore: () => [jest.fn()],
    useAppSessionData: () => [jest.fn()],
    useSelectedAccount: () => ({
      sapAccountId: '123'
    })
  }
})

describe('QuoteDetails', () => {
  beforeEach(() => {
    // track network requests for each test
    jest.clearAllMocks()
  })
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should render loader when quote details are not available yet', () => {
    render(<QuoteDetails />, { store: setUpStore() })
    expect(screen.getByText('quotes.loading_quote_message.label')).toBeTruthy()
    expect(screen.getByRole('progressbar')).toBeTruthy()
  })

  it('should not render loader when data is available', async () => {
    render(<QuoteDetails />, { store: setUpStore() })
    await actAwait()
    expect(screen.queryByText('quotes.loading_quote_message.label')).toBeNull()
  })

  it('should render appropriate actions for tablet', async () => {
    render(<QuoteDetails />, { store: setUpStore(), width: 900 })
    await actAwait()
    expect(screen.getByRole('button', { name: 'add common.actions.label' })).toBeDefined()
  })

  it('should render appropriate actions for mobile', async () => {
    render(<QuoteDetails />, { store: setUpStore(), width: 599 })
    await actAwait()
    expect(screen.getByRole('button', { name: 'add common.actions.label' })).toBeDefined()
  })

  it('should render appropriate actions for desktop', async () => {
    render(<QuoteDetails />, { store: setUpStore() })
    await actAwait()
    expect(screen.queryByRole('button', { name: 'common.add_products.label' })).toBeFalsy()
    expect(screen.getByRole('button', { name: 'common.edit.label' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'quotes.convert_to_order.label' })).toBeDefined()
  })

  it('should render top bar with back button for mobile', async () => {
    render(<QuoteDetails />, { store: setUpStore(), width: 900 })
    await actAwait()
    expect(screen.getByText('arrow_back')).toBeTruthy()
  })

  it('should render tables for product list for desktop', async () => {
    render(<QuoteDetails />, { store: setUpStore() })
    await actAwait()
    expect(screen.getAllByRole('table').length).toBe(4)
  })

  it('should render retry button when view quote details fails', async () => {
    server.use(http.get(/\/quotes\/[0-9]/, () => HttpResponse.error()))
    render(<QuoteDetails />, { store: setUpStore() })
    await actAwait()
    expect(screen.getByRole('button', { name: 'common.try_again.label' })).toBeDefined()
    expect(screen.getByText(/quotes.could_not_load_quote.label/)).toBeDefined()
    expect(screen.getByText(/quotes.could_not_load_quote.description/)).toBeDefined()
  })
})
