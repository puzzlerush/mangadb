const express = require('express')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')
const morgan = require('morgan')
const mangaRouter = require('./routers/manga')

const port = process.env.PORT

const app = express()

app.use(cors())
app.use(morgan('dev'))

app.use('/mangadb', mangaRouter)

app.use('/', createProxyMiddleware({
  target: 'https://api.mangadex.org/v2',
  changeOrigin: true,
  onProxyRes: (proxyRes, req, res) => {
    delete proxyRes.headers['Access-Control-Allow-Origin']
    proxyRes.headers['Access-Control-Allow-Origin'] = '*'
  }
}))

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})