/* eslint-disable */
export default {
  displayName: 'features-channel-quotes',
  preset: '../../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/features/channel/quotes',
  setupFilesAfterEnv: ['../../../../jest.polyfills.js', '../../../../setupJestMock.ts']
}
