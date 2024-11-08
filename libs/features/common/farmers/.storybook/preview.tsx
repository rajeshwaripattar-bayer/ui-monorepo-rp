import '@element/themes/dad'

import { myCropPortalConfig } from '@gc/shared/env'
import { setupFasteStore, TestWrapper } from '@gc/shared/test'
import type { InitialEntry } from '@remix-run/router'
import type { StoryContext, StoryFn } from '@storybook/react'

import { mockFasteStoreMyCrop } from '../src/mocks/fasteStore'
import { setupStore } from '../src/store'

const fasteStore = setupFasteStore(mockFasteStoreMyCrop, [myCropPortalConfig])

const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  },
  decorators: [
    (Story: StoryFn, context: StoryContext) => {
      const initialEntries = context.args.initialEntries as InitialEntry[]
      return (
        <TestWrapper
          fasteStore={fasteStore}
          providerProps={{ store: setupStore() }}
          memoryRouterProps={{ initialEntries }}
        >
          <Story />
        </TestWrapper>
      )
    }
  ]
}

export default preview
