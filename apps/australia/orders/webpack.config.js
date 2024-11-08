const { NxWebpackPlugin } = require('@nx/webpack')
const { NxReactWebpackPlugin } = require('@nx/react')
const { join } = require('path')

module.exports = {

  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ],
  },
  ignoreWarnings: [/Failed to parse source map/],

  devtool: false,
  devtool: 'source-map',
  ignoreWarnings: [
    (warning) =>
      warning.message.includes("Failed to parse source map"),
  ],

  output: {
    path: join(__dirname, '../../../dist/apps/australia/orders')
  },
  devServer: {
    port: 4200
  },
  plugins: [
    new NxWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/main.tsx',
      index: './src/index.html',
      baseHref: '/',
      assets: ['./src/favicon.ico', './src/assets'],
      styles: ['./src/styles.scss'],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production'
    }),
    new NxReactWebpackPlugin({
      // Uncomment this line if you don't want to use SVGR
      // See: https://react-svgr.com/
      // svgr: false
    })
  ]
}
