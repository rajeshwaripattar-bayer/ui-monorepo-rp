import { getAzureClient, initAzureClient } from './client'

describe('apiHybris', () => {
  it('should work', () => {
    initAzureClient()

    expect(getAzureClient()).toBeDefined()
  })
})
