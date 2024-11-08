/* eslint-disable */
export default {
  displayName: 'shared-env',
  preset: '../../../jest.preset.js',
  transform: { '^.+\\.(tsx?|js|html)$': ['ts-jest'] },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/shared/env'
}
