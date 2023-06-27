const baseConfig = require('./webpack.base')
const _merge = require('lodash/merge')

module.exports = _merge(baseConfig("production"), {
  mode: 'production',
  devtool: 'source-map',
})
