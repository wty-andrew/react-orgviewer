const path = require('path')
const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackConfig = require('./webpack.config.dev')

const app = express()

const compiler = webpack(webpackConfig)
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: { colors: true },
  })
)
app.use(webpackHotMiddleware(compiler))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './example/index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, err => {
  if (!err) {
    /* eslint-disable no-console */
    console.log(`Server is running on port ${PORT}`)
  }
})
