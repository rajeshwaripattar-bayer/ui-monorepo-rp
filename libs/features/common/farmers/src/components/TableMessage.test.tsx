import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import React from 'react'

import TableMessage from './TableMessage'

test('no data message', () => {
  render(<TableMessage loading={false} error={false} refetch={() => {}} />)

  const message = screen.queryAllByText(/global.errors.dataUnavailable/)

  expect(message).toBeTruthy()
})

test('error message', () => {
  render(<TableMessage loading={false} error={true} refetch={() => {}} />)

  const message = screen.getByText(/global.errors.tryAgainMessage/)

  expect(message).toBeInTheDocument()
})

test('loading message', () => {
  render(<TableMessage loading={true} error={false} refetch={() => {}} />)

  const messages = screen.queryAllByText(/[a-zA-Z]+/)

  expect(messages).toHaveLength(0)
})
