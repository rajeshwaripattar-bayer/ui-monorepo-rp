import React from 'react'

import TestWrapper, { TestWrapperProps } from './TestWrapper'
import { render, RenderOptions } from '@testing-library/react'

export function renderWithTestWrapper(
  ui: React.ReactElement,
  testWrapperProps?: Omit<TestWrapperProps, 'children'>,
  renderOptions?: RenderOptions
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper {...testWrapperProps}>{children}</TestWrapper>
  )

  // Return an object with the store and all of RTL's query functions
  return {
    store: testWrapperProps?.providerProps?.store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  }
}
