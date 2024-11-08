import { render, screen, actAwait, fireEvent, trackMockedServices } from '@gc/utils'
import { MemoryRouter as Router } from 'react-router-dom'
import SelectQuantity from './SelectQuantity'
import { setUpStore } from '../../store'
import server from '../mocks/server'
import userEvent from '@testing-library/user-event'
import { mockProducts } from '../mocks/product-list'

const mockPortalConfig = {
  gcPortalConfig: {
    crops: ['Corn', 'Soybeans'],
    cropList: [
      { cropCode: 'seed_corn', cropName: 'Corn' },
      { cropCode: 'seed_soybean', cropName: 'Soybeans' }
    ]
  }
}
jest.mock('@gc/hooks', () => ({
  usePortalConfig: () => {
    return mockPortalConfig
  },
  useLocale: () => ({ code: 'en-US', country: 'US', language: 'en' }),
  useScreenRes: () => 5,
  useCurrentCart: jest.requireActual('@gc/hooks').useCurrentCart,
  useUpdateCartCache: jest.requireActual('@gc/hooks').useUpdateCartCache,
  useUpdateFasteStore: () => [jest.fn()],
  useAppSessionData: () => [jest.fn()]
}))

describe('SelectQuantity', () => {
  let _getEvents: () => { [key: string]: { url: string; body: object | null }[] }

  beforeEach(() => {
    // track network requests for each test
    _getEvents = trackMockedServices(server)
    jest.clearAllMocks()
  })
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  describe('Select Quantity mobile', () => {
    const mockOpenModal = jest.fn()
    const mockSetModal = jest.fn()

    it('should render successfully', async () => {
      const { getByRole } = render(
        <Router>
          <SelectQuantity product={mockProducts[0]} openModal={mockOpenModal} setModalProps={mockSetModal} />,
        </Router>,
        { store: setUpStore() }
      )
      await actAwait()
      const { headerActions, footerActions } = mockSetModal.mock.calls[0][0]

      expect(getByRole('listbox')).toBeTruthy()
      expect(getByRole('img')).toBeTruthy()
      expect(screen.getAllByPlaceholderText('common.quantity.label')).toBeTruthy()
      expect(getByRole('option')).toBeTruthy()
      const _user = userEvent.setup()

      expect(headerActions.props).toStrictEqual({
        title: 'common.select_quantity.label',
        exitIconButtonProps: { icon: 'arrow_back', onClick: expect.any(Function) }
      })
      expect(footerActions.props.label).toBe('common.add.label  •  $100.00/SSU')
    })

    it('should show quantity input and enabled/disabled based on whether there is an input', async () => {
      const { getAllByPlaceholderText, getByLabelText } = render(
        <Router>
          <SelectQuantity product={mockProducts[0]} openModal={mockOpenModal} setModalProps={mockSetModal} />,
        </Router>,
        { store: setUpStore() }
      )
      await actAwait()
      const { footerActions } = mockSetModal.mock.calls[0][0]

      expect(footerActions.props.disabled).toBe(true)
      expect(getAllByPlaceholderText('common.quantity.label')).toBeTruthy()
      fireEvent.change(getAllByPlaceholderText('common.quantity.label')[0], { target: { value: '10' } })

      expect(getByLabelText('Warehouse 1')).toBeTruthy()
      expect(getByLabelText('Warehouse 2')).toBeTruthy()
      expect(getByLabelText('Warehouse 3')).toBeTruthy()
      expect(getByLabelText('Warehouse 4')).toBeTruthy()

      //check storage locations can be changed

      //when user clicks back then route to select products

      //when user clicks add then check for cart api put action and route to select products
    })
  })
})
