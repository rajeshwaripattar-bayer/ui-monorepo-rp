import { render, actAwait } from '@gc/utils'
import { MemoryRouter as Router } from 'react-router-dom'
import { setUpStore } from '../../store'
import server from '../mocks/server'
import AddDiscountsModal from './AddDiscountsModal'
import { HttpResponse, http } from 'msw'

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
    }
  }
}

jest.mock('@gc/hooks', () => {
  return {
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
    useCurrentCart: () => ({
      data: {
        grower: '1234567890',
        code: '1234567890',
        entries: []
      }
    }),
    useSelectedAccount: () => ({ sapAccountId: '1234567890' })
  }
})

describe('AddDiscountsModal', () => {
  beforeEach(() => {
    // track network requests for each test
    jest.clearAllMocks()
  })
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  describe('AddDiscountsModal Desktop', () => {
    const mockOpenModal = jest.fn()
    const mockSetModal = jest.fn()

    it('should display loader for products initially', async () => {
      const { getByText } = render(
        <Router>
          <AddDiscountsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
        </Router>,
        { store: setUpStore() }
      )
      expect(getByText('common.loading_discounts.label')).toBeDefined()
    })

    it('should display appropriate message when discretionary budgets API is not available', async () => {
      server.use(http.post(/discretionary-budgets/, () => HttpResponse.error()))
      const { getByText, getByRole } = render(
        <Router>
          <AddDiscountsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
        </Router>,
        { store: setUpStore() }
      )
      await actAwait(1000)
      expect(getByText('common.data_load_failed.label')).toBeDefined()
      expect(getByRole('button', { name: 'common.try_again.label' })).toBeDefined()
    })
  })
})
