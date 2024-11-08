/* eslint-disable */
export default {
  displayName: 'api-client',
  preset: '../../../jest.preset.js',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/api/client',
  setupFilesAfterEnv: ['../../../jest.polyfills.js', '../../../setupJestMock.ts']
}
