/** Source: https://github.com/nrwl/nx/issues/14378#issuecomment-1417523527 */
const withSvgFix = () => (config) => {
  config.module?.rules?.forEach((rule) => {
    if (typeof rule === 'string') {
      return
    }

    if (typeof rule.loader !== 'undefined' && /file-loader/.test(rule.loader)) {
      rule.test = /\.(eot|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/ // Excluding `svg`
      rule.type = 'javascript/auto' // Fixing images
    }

    if (rule.test instanceof RegExp && rule.test.test('.svg')) {
      rule.use = ['@svgr/webpack', 'url-loader']
    }
  })
  return config
}

const withDevServerErrorSuppression = () => (config) => {
  if (config.devServer) {
    config.devServer = {
      ...config.devServer,
      client: {
        ...config.devServer.client,
        overlay: {
          ...config.devServer.client.overlay,
          errors: true,
          warnings: false,
          runtimeErrors: (error) => {
            if (error.name === 'TypeError' || error.message.includes('ResizeObserver')) {
              return false
            }
            return true
          }
        }
      }
    }
  }
  return config
}

const withGlobalCommerce = () => (config) => {
  config.optimization.runtimeChunk = false
  config.output.libraryTarget = 'system'
  return config
}

module.exports = { withSvgFix, withDevServerErrorSuppression, withGlobalCommerce }
