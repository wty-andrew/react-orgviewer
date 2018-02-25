const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const extractSass = new ExtractTextPlugin({
  filename: 'css/style.css',
})

module.exports = {
  entry: path.join(__dirname, './example/index.js'),
  output: {
    path: path.join(__dirname, './demo'),
    publicPath: '/',
    filename: 'js/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /(\.css|\.scss)$/,
        use: extractSass.extract({
          use: ['css-loader', 'sass-loader'],
        }),
      },
    ],
  },
  plugins: [new webpack.EnvironmentPlugin(['NODE_ENV']), extractSass],
}
