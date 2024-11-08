const path = require('path')
const { composePlugins, withNx, withWeb } = require('@nx/webpack')
const { withReact } = require('@nx/react')

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withWeb(), withReact(), (config) => {
  return config
})
