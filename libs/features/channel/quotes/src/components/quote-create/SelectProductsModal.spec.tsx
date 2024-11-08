import { render, screen, actAwait, fireEvent, trackMockedServices, act, waitFor } from '@gc/utils'
import { setUpStore } from '../../store'
import { MemoryRouter as Router } from 'react-router-dom'
import SelectProductsModal from './SelectProductsModal'
import server from '../mocks/server'
import userEvent from '@testing-library/user-event'
import { cornProductsResponse } from '../mocks/products'
import { TestModal } from '../mocks/TestModal'
import * as reduxStore from '@gc/redux-store'
import { http, HttpResponse } from 'msw'
const mockPortalConfig = {
  gcPortalConfig: {
    crops: ['Corn', 'Soybeans'],
    cropList: [
      { cropCode: 'seed_corn', cropName: 'Corn' },
      { cropCode: 'seed_soybean', cropName: 'Soybeans' }
    ]
  }
}

jest.mock('@gc/hooks', () => {
  return {
    ...jest.requireActual('@gc/hooks'),
    usePortalConfig: () => {
      return mockPortalConfig
    },
    useGcPortalConfig: () => {
      return mockPortalConfig.gcPortalConfig
    },
    useLocale: () => ({ code: 'en-US', country: 'US', language: 'en' }),
    useScreenRes: () => 5,
    useUpdateFasteStore: () => [jest.fn()],
    useAppSessionData: () => [jest.fn()]
  }
})

describe('SelectProductsModal', () => {
  let getEvents: () => { [key: string]: { url: string; body: object | null }[] }
  beforeEach(() => {
    // track network requests for each test
    getEvents = trackMockedServices(server)
    jest.clearAllMocks()
  })
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  describe('SelectProductsModal Desktop', () => {
    const mockOpenModal = jest.fn()
    const mockSetModal = jest.fn()

    describe('SelectProductsModal Desktop Create Quote Workflow', () => {
      it('should display loader for products initially', async () => {
        const { getByText } = render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: setUpStore() }
        )
        expect(getByText('products.loading_products_message.label')).toBeDefined()
      })

      it('should render Corn(first tab) table with expected columns, header and footer props', async () => {
        const { container, getByRole } = render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: setUpStore() }
        )
        await waitFor(() => expect(container.getElementsByTagName('table').length).toBe(1))

        const { headerActions, footerActions } = mockSetModal.mock.calls[0][0]
        expect(getByRole('columnheader', { name: 'common.product_name.label' })).toBeDefined()
        expect(getByRole('columnheader', { name: 'common.warehouse.label' })).toBeDefined()
        expect(getByRole('columnheader', { name: 'common.retail_price.label' })).toBeDefined()
        expect(getByRole('columnheader', { name: 'common.allocation.label' })).toBeDefined()
        expect(getByRole('columnheader', { name: 'common.quantity.label (common.ssu.label)' })).toBeDefined()
        expect(getByRole('columnheader', { name: 'common.sub_total.label' })).toBeDefined()
        expect(getByRole('cell', { name: 'PR114-20SSC TRE 50USP F+I+N+B360 common.on_exclusion.label' })).toBeDefined()
        expect(headerActions.props).toStrictEqual({
          title: 'common.add_products.label',
          exitIconButtonProps: { icon: 'arrow_back', onClick: expect.any(Function) },
          trailingIconButtonProps: { icon: 'search', onClick: expect.any(Function) }
        })
        expect(footerActions.props.label).toBe('quotes.review_quote.label  •  0 common.product.label')
      })

      it('should fetch products for Soybean when Tab is changed', async () => {
        const { getByRole, queryByRole } = render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: setUpStore() }
        )
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())
        expect(getByRole('cell', { name: 'PR114-20SSC TRE 50USP F+I+N+B360 common.on_exclusion.label' })).toBeDefined()
        await act(async () => fireEvent.click(screen.getByRole('tab', { name: 'SOYBEANS' })))
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())
        expect(queryByRole('cell', { name: 'PR114-20SSC TRE 50USP F+I+N+B360 common.on_exclusion.label' })).toBeNull()
        expect(getByRole('cell', { name: '3823RXF 40SCU BOX BASIC-F+ILEVO' })).toBeDefined()
      })

      it('should keep View quote button disabled until at least 1 product with quantity is selected', async () => {
        const user = userEvent.setup()
        const { getAllByRole } = render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: setUpStore() }
        )
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())

        const { footerActions: footerActions1 } = mockSetModal.mock.calls[0][0]
        expect(footerActions1.props.label).toBe('quotes.review_quote.label  •  0 common.product.label')
        await act(async () => user.click(getAllByRole('combobox')[0]))
        await act(async () => user.click(getAllByRole('option', { name: '00002 - Warehouse 2' })[0]))
        expect(footerActions1.props.label).toBe('quotes.review_quote.label  •  0 common.product.label')
        expect(footerActions1.props.disabled).toBe(true)
        await act(async () => fireEvent.change(getAllByRole('spinbutton')[0], { target: { value: '999' } }))
        const { footerActions: footerActions3 } = mockSetModal.mock.calls[2][0]
        await actAwait()
        expect(footerActions3.props.label).toBe('quotes.review_quote.label  •  1 common.product.label')
        expect(footerActions3.props.disabled).toBe(false)
      })

      it('should display "Added" to product name one qty was provided', async () => {
        const { queryByText, getByText } = render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: setUpStore() }
        )
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())

        expect(queryByText('Added')).toBeNull()
        await act(async () => fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '1' } }))
        expect(getByText('common.added.label')).toBeDefined()
      })

      it('should adjust sub total after qty was added', async () => {
        const { getAllByTestId, queryByText } = render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: setUpStore() }
        )
        await waitFor(() => expect(queryByText('products.loading_products_message.label')).toBeNull())
        expect(getAllByTestId('subtotal')[0].innerHTML).toBe('$0.00')
        await waitFor(() => expect(fireEvent.change(screen.getAllByRole('spinbutton')[0])).toBeDefined())
        await act(async () => fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '2' } }))
        expect(getAllByTestId('subtotal')[0].innerHTML).toBe('$791.00')
      })

      it('should display appropriate filters based on facets in API response and not display acronym filter', async () => {
        const { getByRole, queryByRole, queryByText } = render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: setUpStore() }
        )
        await waitFor(() => expect(queryByText('products.loading_products_message.label')).toBeNull())

        expect(getByRole('checkbox', { name: 'common.all_filters.label' })).toBeDefined()
        expect(getByRole('checkbox', { name: 'Treatment' })).toBeDefined()
        expect(getByRole('checkbox', { name: 'Trait Code' })).toBeDefined()
        expect(getByRole('checkbox', { name: 'Package Type' })).toBeDefined()
        expect(getByRole('checkbox', { name: 'Package Size' })).toBeDefined()
        expect(queryByRole('checkbox', { name: 'Acronym Name Value' })).toBeNull()
      })

      it('should call bayer entries PUT API with appropriate entry when quantity was updated', async () => {
        render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: setUpStore() }
        )
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())

        await act(async () => fireEvent.blur(screen.getAllByRole('spinbutton')[0], { target: { value: '2' } }))
        const putEntriesEvent = getEvents().POST.find((e) => e.url.match(/bayer-entries/))
        expect(putEntriesEvent?.body).toStrictEqual({
          orderEntries: [
            expect.objectContaining({
              product: { code: '000000000045361189', name: 'PR114-20SSC TRE 50USP F+I+N+B360' },
              quantity: 2,
              storageLocationCode: '00001'
            })
          ]
        })
      })

      it('should call bayer entries PUT API when storage location is selected if there is qty on that product', async () => {
        const user = userEvent.setup()
        const { getAllByRole } = render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: setUpStore() }
        )
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())

        await act(async () => user.click(getAllByRole('combobox')[0]))
        await act(async () => user.click(getAllByRole('option', { name: '00002 - Warehouse 2' })[0]))
        await act(async () => fireEvent.blur(screen.getAllByRole('spinbutton')[0], { target: { value: '2' } }))
        const putEntriesEvent = getEvents().POST.find((e) => e.url.match(/bayer-entries/))
        expect(putEntriesEvent?.body).toStrictEqual({
          orderEntries: [
            expect.objectContaining({
              product: { code: '000000000045361189', name: 'PR114-20SSC TRE 50USP F+I+N+B360' },
              quantity: 2,
              storageLocationCode: '00002'
            })
          ]
        })
      })

      it('should not call bayer entries PUT API when storage location is selected if without quantity', async () => {
        const user = userEvent.setup()
        const { getAllByRole } = render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: setUpStore() }
        )
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())

        await act(async () => user.click(getAllByRole('combobox')[0]))
        await act(async () => user.click(getAllByRole('option', { name: '00002 - Warehouse 2' })[0]))
        expect(getEvents().POST).toBeUndefined()
        expect(getEvents().PUT).toBeUndefined()
      })

      it('should call endpoint to convert cart to quote upon View Quote button click', async () => {
        const { getByTestId } = render(
          <Router>
            <TestModal modalBody={SelectProductsModal} openModal={mockOpenModal} />
          </Router>,
          { store: setUpStore() }
        )
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())
        await act(async () => fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '2' } }))
        await act(async () => fireEvent.click(getByTestId('review-quote-action')))
        const postQuoteEvent = getEvents().POST.find((e) => e.url.match(/quotes/))
        expect(postQuoteEvent?.body).toStrictEqual({ cartId: '0000107952' })
      })

      it('should display "On Exclusion" to product name if `canView` = true and `canOrder` = false', async () => {
        const { getAllByText } = render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: setUpStore() }
        )
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())
        expect(getAllByText('common.on_exclusion.label').length).toBe(1)
      })
    })

    describe('SelectProductsModal Desktop Edit Quote Workflow', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let storeWithEditMode: any
      beforeEach(() => {
        storeWithEditMode = setUpStore({
          quotes: { ...setUpStore().getState().quotes, inEditMode: true }
        })
      })

      it('should render appropriate footer actions', async () => {
        render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: storeWithEditMode }
        )
        await actAwait(100)
        const { footerActions } = mockSetModal.mock.calls[1][0]
        expect(footerActions.props.children[0].props.label).toBe('common.cancel.label')
        expect(footerActions.props.children[1].props.label).toBe('common.add.label 0 common.product.label')
        expect(footerActions.props.children[0].props.disabled).toBe(false)
        expect(footerActions.props.children[1].props.disabled).toBe(true)
      })

      it('should not call API when quantity/storage location changes ', async () => {
        const user = userEvent.setup()
        const { getAllByRole } = render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: storeWithEditMode }
        )
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())
        const { footerActions: footerActions1 } = mockSetModal.mock.calls[1][0]
        expect(footerActions1.props.children[1].props.disabled).toBe(true)
        await act(async () => user.click(getAllByRole('combobox')[0]))
        await act(async () => user.click(getAllByRole('option', { name: '00002 - Warehouse 2' })[0]))
        await act(async () => fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '2' } }))
        const { footerActions: footerActions3 } = mockSetModal.mock.calls[2][0]
        expect(footerActions3.props.children[1].props.disabled).toBe(false)
        expect(footerActions3.props.children[0].props.disabled).toBe(false)
        expect(footerActions3.props.children[1].props.label).toBe('common.add.label 1 common.product.label')
        expect(getEvents().PUT).toBeUndefined()
        expect(getEvents().POST).toBeUndefined()
      })

      it('should keep add/cancel button clear if warehouse is selected but no products have quantity', async () => {
        const user = userEvent.setup()
        const { getAllByRole } = render(
          <Router>
            <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
          </Router>,
          { store: storeWithEditMode }
        )
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())

        const { footerActions: footerActions1 } = mockSetModal.mock.calls[1][0]
        expect(footerActions1.props.children[1].props.disabled).toBe(true)
        await act(async () => user.click(getAllByRole('combobox')[0]))
        await act(async () => user.click(getAllByRole('option', { name: '00002 - Warehouse 2' })[0]))
        expect(footerActions1.props.children[1].props.disabled).toBe(true)
      })

      it('should call bayer entries POST endpoint for all non-zero quantity products when Add button is clicked ', async () => {
        const user = userEvent.setup()
        const { getAllByRole, getByTestId } = render(
          <Router>
            <TestModal modalBody={SelectProductsModal} openModal={mockOpenModal} />
          </Router>,
          { store: storeWithEditMode }
        )
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())
        await act(async () => fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '2' } }))
        await act(async () => fireEvent.change(screen.getAllByRole('spinbutton')[1], { target: { value: '0' } }))
        await act(async () => user.click(getAllByRole('combobox')[0]))
        await act(async () => user.click(getAllByRole('option', { name: '00002 - Warehouse 2' })[0]))
        await act(async () => user.click(getAllByRole('combobox')[2]))
        await act(async () => user.click(getAllByRole('option', { name: '00002 - Warehouse 2' })[2]))

        await act(async () => fireEvent.click(getByTestId('add-products-action')))
        const postEntriesEvent = getEvents().POST.find((e) => e.url.match(/bayer-entries/))
        expect(postEntriesEvent?.body).toStrictEqual({
          orderEntries: [
            expect.objectContaining({
              product: { code: '000000000045361189', name: 'PR114-20SSC TRE 50USP F+I+N+B360' },
              quantity: 2,
              storageLocationCode: '00001'
            })
          ]
        })
        expect(mockOpenModal).toHaveBeenCalledWith('EXIT')
      })

      it('should set appropriate contingency when quote creation fails', async () => {
        const setContingencySpy = jest.spyOn(reduxStore, 'setContingency')
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
            <TestModal modalBody={SelectProductsModal} openModal={mockOpenModal} />
          </Router>,
          { store: setUpStore() }
        )
        await waitFor(() => expect(screen.getAllByRole('spinbutton')[0]).toBeDefined())
        await act(async () => fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '2' } }))
        await act(async () => fireEvent.click(getByTestId('review-quote-action')))
        expect(getByTestId('review-quote-action').hasAttribute('disabled')).toBe(true)
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

  describe('SelectProductsModal Mobile', () => {
    const mockOpenModal = jest.fn()
    const mockSetModal = jest.fn()

    it('should display products as a list', async () => {
      const { container, getByRole, getAllByRole } = render(
        <Router>
          <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
        </Router>,
        { width: 1023, store: setUpStore() }
      )
      await waitFor(() => expect(getByRole('listbox')).toBeDefined())
      expect(container.getElementsByTagName('table').length).toBe(0)
      expect(getByRole('listbox')).toBeDefined()
      expect(
        getByRole('option', {
          name: 'common.on_exclusion.label PR114-20SSC TRE 50USP F+I+N+B360 $395.50/SSU 0 SSU common.available.label'
        })
      ).toBeDefined()
      expect(getAllByRole('option').length).toBe(3)
    })

    it('should display filter and sort chips', async () => {
      const { getByRole, getAllByRole } = render(
        <Router>
          <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
        </Router>,
        { width: 1023, store: setUpStore() }
      )
      await waitFor(() => expect(getAllByRole('checkbox').length).toBeGreaterThan(0))
      expect(getByRole('checkbox', { name: 'Filters' })).toBeDefined()
      expect(getByRole('checkbox', { name: 'products.name_a-z.label' })).toBeDefined()
    })

    it('should open Select Quantity modal when any product is clicked', async () => {
      const user = userEvent.setup()
      const { getAllByRole } = render(
        <Router>
          <SelectProductsModal openModal={mockOpenModal} setModalProps={mockSetModal} />
        </Router>,
        { width: 1023, store: setUpStore() }
      )
      await waitFor(() => expect(getAllByRole('option')[0]).toBeDefined())
      await act(async () => user.click(getAllByRole('option')[0]))
      expect(mockOpenModal.mock.calls[0][0]).toBe('SELECT_QUANTITY')
      expect(mockOpenModal.mock.calls[0][1]).toEqual({
        product: cornProductsResponse.products[0]
      })
    })
  })
})
