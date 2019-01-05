const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const ChromeExtensionReloader  = require('webpack-chrome-extension-reloader');
  module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      contentBase: './dist'
    },
    plugins: [
      new ChromeExtensionReloader(),
    ]
});