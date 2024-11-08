const { ModuleFederationPlugin } = require('@module-federation/enhanced')
const { withReact } = require('@nx/react')
const { composePlugins, withNx } = require('@nx/webpack')

const { dependencies } = require('../../../package.json')
const { withGlobalCommerce, withDevServerErrorSuppression, withSvgFix } = require('../../../webpackPlugins')
const { getPublicPath } = require('../../../dynamicPublicPath')

const withModuleFederation = () => (config) => {
  const publicPath = getPublicPath('seedsman-farmers-ui', 4200)
  const nbmWidgetPublicPath = getPublicPath('nbm-program-tracking-widget', 4010)
  config.output.publicPath = publicPath
  config.plugins ??= []
  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'seedsmanFarmers',
      remotes: {
        // Change to localhost to use local build of E&E
        // eligibilityEnrollmentLibrary: 'eligibilityEnrollmentLibrary@http:/localhost:1236/bundle.js'
        eligibilityEnrollmentLibrary:
          'eligibilityEnrollmentLibrary@https://climate.com/static/global/eligibility-enrollment-library/latest/bundle.js',
        nbmWidget: `program_tracking_widget@${nbmWidgetPublicPath}program_tracking_widget.js`
      },
      shared: {
        ...Object.keys(dependencies).reduce((acc, dep) => {
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
  withReact(),
  withSvgFix(),
  withModuleFederation(),
  withDevServerErrorSuppression(),
  withGlobalCommerce()
)
