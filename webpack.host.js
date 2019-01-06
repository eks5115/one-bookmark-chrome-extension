
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

const hostManifest = require('./src/host.manifest');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    host: `./src/host/host.js`
  },
  target: "node",
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
    new ManifestPlugin({
      fileName: `${hostManifest.name}.json`,
      serialize: () => {
        return JSON.stringify(hostManifest, null, 2)
      }
    }),
    new CopyWebpackPlugin([
      {
        from: './src/host/register.sh',
      }
    ])
  ]
};