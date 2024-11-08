import { act, actAwait, fireEvent, render, trackMockedServices, waitFor } from '@gc/utils'
import { MemoryRouter as Router } from 'react-router-dom'

import { HttpResponse, http } from 'msw'
import { setUpStore } from '../../store'
import { newCart } from '../mocks/cart'
import server from '../mocks/server'
import AbandonQuoteModal from './AbandonQuoteModal'
import * as reduxStore from '@gc/redux-store'
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
  useAppSessionData: () => [jest.fn()],
  useSelectedAccount: () => ({ sapAccountId: '123' })
}))

describe('AbandonQuoteModal', () => {
  let getEvents: () => { [key: string]: { url: string; body: object | null }[] }
  const cartWithEntries = {
    ...newCart,
    entries: [{ entryNumber: 1, product: { code: '123' }, quantity: 1, storageLocationCode: 'SL1' }]
  }

  const mockOpenModal = jest.fn()
  const mockSetModal = jest.fn()

  beforeEach(() => {
    // track network requests for each test
    getEvents = trackMockedServices(server)
    jest.clearAllMocks()
  })
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should update modal once', async () => {
    const { getByRole } = render(
      <Router>
        <AbandonQuoteModal openModal={mockOpenModal} setModalProps={mockSetModal} />
      </Router>,
      { store: setUpStore() }
    )
    await actAwait()
    await act(async () => fireEvent.click(getByRole('button', { name: 'common.discard.label' })))
    expect(mockSetModal).toHaveBeenCalledTimes(1)
  })

  it('should render appropriate info when no products are selected', async () => {
    const { getByText, getByRole } = render(
      <Router>
        <AbandonQuoteModal openModal={mockOpenModal} setModalProps={mockSetModal} />
      </Router>,
      { store: setUpStore() }
    )
    await actAwait()

    expect(getByText(/common.cancel.label/)).toBeDefined()
    expect(getByText(/quotes.discard_this_quote.label/)).toBeDefined()
    const returnToQuoteButton = getByRole('button', { name: 'common.discard.label' })
    const discardQuoteButton = getByRole('button', { name: 'common.cancel.label' })
    expect(returnToQuoteButton).toBeDefined()
    expect(discardQuoteButton).toBeDefined()
  })

  it('should call appropriate action if user decides to return to quote', async () => {
    const { getByRole, queryByText } = render(
      <Router>
        <AbandonQuoteModal openModal={mockOpenModal} setModalProps={mockSetModal} />
      </Router>,
      { store: setUpStore() }
    )
    await waitFor(() => expect(queryByText('cart.loading_cart_message.label')).toBeNull())
    const returnToQuoteButton = getByRole('button', { name: 'common.cancel.label' })
    fireEvent.click(returnToQuoteButton)
    expect(mockOpenModal).toHaveBeenCalledWith('CREATE_QUOTE')
  })

  it('should call appropriate action if user discard quote', async () => {
    const { getByRole, queryByText } = render(
      <Router>
        <AbandonQuoteModal openModal={mockOpenModal} setModalProps={mockSetModal} />
      </Router>,
      { store: setUpStore() }
    )
    await waitFor(() => expect(queryByText('cart.loading_cart_message.label')).toBeNull())
    await act(async () => fireEvent.click(getByRole('button', { name: 'common.discard.label' })))
    expect(getEvents().DELETE.find((e) => e.url.match(new RegExp(`carts/${newCart.code}`)))).toBeDefined()
  })

  it('should render appropriate info when products are selected', async () => {
    server.use(http.get(/\/carts/, () => HttpResponse.json(cartWithEntries)))
    const { getByText, getByRole } = render(
      <Router>
        <AbandonQuoteModal openModal={mockOpenModal} setModalProps={mockSetModal} />
      </Router>,
      { store: setUpStore() }
    )
    await actAwait()
    expect(getByText(/quotes.save_this_quote.label/)).toBeDefined()
    expect(getByText(/quotes.save_or_discard_quote.description/)).toBeDefined()

    const saveAsDraftButton = getByRole('button', { name: 'common.save_as_draft.label' })
    const discardQuoteButton = getByRole('button', { name: 'common.discard.label' })
    expect(saveAsDraftButton).toBeDefined()
    expect(discardQuoteButton).toBeDefined()
  })

  it('should call appropriate action if user decides to save as draft', async () => {
    server.use(http.get(/\/carts/, () => HttpResponse.json(cartWithEntries)))
    const { getByRole, queryByText } = render(
      <Router>
        <AbandonQuoteModal openModal={mockOpenModal} setModalProps={mockSetModal} />
      </Router>,
      { store: setUpStore() }
    )
    await waitFor(() => expect(queryByText('cart.loading_cart_message.label')).toBeNull())
    await act(async () => fireEvent.click(getByRole('button', { name: 'common.save_as_draft.label' })))
    await waitFor(() => expect(mockOpenModal).toHaveBeenCalledWith('EXIT'))
    await actAwait()
    const postQuoteEvent = getEvents().POST.find((e) => e.url.match(/quotes/))
    expect(postQuoteEvent?.body).toStrictEqual({ cartId: '0000107952' })
    expect(mockOpenModal).toHaveBeenCalledWith('EXIT')
  })

  it('should set appropriate contingency when save cart as draft quote fails', async () => {
    const setContingencySpy = jest.spyOn(reduxStore, 'setContingency')
    server.use(http.get(/\/carts/, () => HttpResponse.json(cartWithEntries)))
    server.use(
      http.post(/\/quotes/, () => {
        return new HttpResponse(null, {
          status: 400,
          statusText: 'Bad Request'
        })
      })
    )
    const { getByRole, queryByText } = render(
      <Router>
        <AbandonQuoteModal openModal={mockOpenModal} setModalProps={mockSetModal} />
      </Router>,
      { store: setUpStore() }
    )
    await waitFor(() => expect(queryByText('cart.loading_cart_message.label')).toBeNull())
    await act(async () => fireEvent.click(getByRole('button', { name: 'common.save_as_draft.label' })))
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
