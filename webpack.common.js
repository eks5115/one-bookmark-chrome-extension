
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

const manifest = require('./src/manifest');

module.exports = {
  entry: {
    index: './src/index.js',
    background: './src/background.js',
    popup: './src/popup.js',
  },
  node: {
    fs: 'empty',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: './src/popup.html',
      chunks: [
        'popup'
      ]
    }),
    new ManifestPlugin({
      serialize: () => {
        return JSON.stringify(manifest, null, 2)
      }
    })
  ]
};