import { appendLeadingZeros } from './format'

describe('format', () => {
  describe('appendLeadingZeros', () => {
    test('string is padded to proper length', () => {
      const result = appendLeadingZeros('123')

      expect(result).toBe('0000000123')
    })

    test('string is not modified is proper length or longer', () => {
      const result = appendLeadingZeros('1234567890123')

      expect(result).toBe('1234567890123')
    })
  })
})
