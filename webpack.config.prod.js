const path = require('path')
const webpack = require('webpack')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')

// const extractSass = new ExtractTextPlugin({
//   filename: 'my-component.css',
// })

module.exports = {
  entry: path.join(__dirname, './src/OrgViewer.js'),
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      // {
      //   test: /(\.css|\.scss)$/,
      //   use: extractSass.extract({
      //     use: ['css-loader', 'sass-loader'],
      //   }),
      // },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    // extractSass
  ],
  externals: {
    react: 'react',
    'react-syntax-highlighter': 'react-syntax-highlighter',
  },
}
