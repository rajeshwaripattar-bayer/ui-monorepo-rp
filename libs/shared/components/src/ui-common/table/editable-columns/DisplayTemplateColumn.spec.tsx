import { render } from '@testing-library/react'

import DisplayTemplateColumn from './DisplayTemplateColumn'

describe('DisplayTemplateColumn', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DisplayTemplateColumn />)
    expect(baseElement).toBeTruthy()
  })
})
