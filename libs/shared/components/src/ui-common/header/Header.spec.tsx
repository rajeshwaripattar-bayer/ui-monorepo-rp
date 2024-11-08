import { screen } from '@gc/utils'
import { renderWithTestWrapper } from '@gc/shared/test'

import Header from './Header'
import { noop } from 'lodash'

const header = (
  <Header
    title='Test'
    overlineText='myBadge'
    secText1='cool description'
    buttonProps={[
      { label: 'create quote', onClick: noop },
      { label: 'edit', onClick: noop, variant: 'outlined' }
    ]}
  />
)

describe('Header', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithTestWrapper(
      <Header title='Test Title' secText1='Documentation' overlineText='My Banner' />
    )

    expect(baseElement).toBeTruthy()
    expect(screen.getByText(/Test/)).toBeTruthy()
    expect(screen.getByText(/Documentation/)).toBeTruthy()
    expect(screen.getByText(/My Banner/)).toBeTruthy()
  })

  it('should render successfully with mobile Buttons and no badge text', () => {
    const buttonProps = [
      {
        label: 'more',
        onClick: noop
      },
      { label: 'edit', onClick: noop, variant: 'outlined' },
      {
        label: 'covert to order',
        onClick: noop,
        variant: 'filled'
      }
    ]
    renderWithTestWrapper(<Header title='Test Title' secText1='Documentation' buttonProps={buttonProps} />)
    expect(screen.getByRole('button', { name: 'more' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'covert to order' })).toBeDefined()
  })
  it('should render desktop button if desktop button props were passed', () => {
    renderWithTestWrapper(
      <Header
        title='Test'
        buttonProps={[
          {
            label: 'create quote',
            onClick: noop
          },
          { label: 'edit', onClick: noop, variant: 'outlined' }
        ]}
      />
    )
    expect(screen.getByRole('button', { name: 'create quote' })).toBeDefined()
  })

  it('should render badge, description and title when passed', () => {
    const { getByText } = renderWithTestWrapper(header)
    expect(getByText('cool description')).toBeTruthy()
    expect(getByText('myBadge')).toBeTruthy()
  })

  it('Should render component for screen width greater than 1440', () => {
    const wrapper = renderWithTestWrapper(header, { width: 1440 })
    expect(wrapper).toMatchSnapshot()
  })

  it('Should render component for screen width smaller than 1440', () => {
    const wrapper = renderWithTestWrapper(header, { width: 1439 })
    expect(wrapper).toMatchSnapshot()
  })

  it('Should render component for screen width smaller than 1024', () => {
    const wrapper = renderWithTestWrapper(header, { width: 1023 })
    expect(wrapper).toMatchSnapshot()
  })

  it('Should render component for screen width smaller than 840', () => {
    const wrapper = renderWithTestWrapper(header, { width: 839 })
    expect(wrapper).toMatchSnapshot()
  })

  it('Should render component for screen width smaller than 720', () => {
    const wrapper = renderWithTestWrapper(header, { width: 719 })
    expect(wrapper).toMatchSnapshot()
  })

  it('Should render component for screen width smaller than 600', () => {
    const wrapper = renderWithTestWrapper(header, { width: 599 })
    expect(wrapper).toMatchSnapshot()
  })
})
