import { COMMERCE_CLOUD_API } from './shared-env'

describe('shared-env', () => {
  it('COMMERCE_CLOUD_API key should be defined', () => {
    expect(COMMERCE_CLOUD_API).toBeDefined()
  })
})
