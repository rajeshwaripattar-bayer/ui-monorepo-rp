const { composePlugins, withNx } = require('@nx/webpack')
const { withReact } = require('@nx/react')
const { ModuleFederationPlugin } = require('@module-federation/enhanced')

const { dependencies } = require('../../../package.json')
const { withGlobalCommerce, withDevServerErrorSuppression, withSvgFix } = require('../../../webpackPlugins')
const { getPublicPath } = require('../../../dynamicPublicPath')

const withModuleFederation = () => (config) => {
  const publicPath = getPublicPath('nbm-program-tracking-widget', 4010)
  config.output.publicPath = publicPath
  config.plugins ??= []
  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'program_tracking_widget',
      exposes: {
        './initModule': './src/initModule.ts',
        './withFasteStoreProvider': './src/app/withFasteStoreProvider.tsx',
        './ProgramTrackingWidget': './src/app/ProgramTrackingWidget.tsx'
      },
      shared: {
        ...[
          '@element/react-components',
          '@monsantoit/faste-lite-react',
          '@reduxjs/toolkit',
          'graphql-request',
          'i18next',
          'i18next-http-backend',
          'lodash',
          'react',
          'react-dom',
          'react-router-dom',
          'react-i18next',
          'react-redux'
        ].reduce((acc, dep) => {
          acc[dep] = {
            requiredVersion: dependencies[dep],
            singleton: true
          }
          return acc
        }, {})
      }
    })
  )
  return config
}

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx(),
  withModuleFederation(),
  withSvgFix(),
  withGlobalCommerce(),
  withDevServerErrorSuppression(),
  withReact({
    // Uncomment this line if you don't want to use SVGR
    // See: https://react-svgr.com/
    // svgr: false
  }),
  (config) => {
    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`
    return config
  }
)
