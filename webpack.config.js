const { composePlugins, withNx } = require('@nx/webpack')
const { withReact } = require('@nx/react')
const { withSvgFix, withGlobalCommerce } = require('./webpackPlugins')

module.exports = composePlugins(withNx(), withReact(), withSvgFix(), withGlobalCommerce())
