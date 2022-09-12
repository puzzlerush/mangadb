const express = require('express')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')
const morgan = require('morgan')
const mangaRouter = require('./routers/manga')
const mdhRouter = require('./routers/mdh')
const imageRouter = require('./routers/image')

const port = process.env.PORT

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.use('/mangadb', mangaRouter)

app.use('/mdh', mdhRouter)

app.use('/image', imageRouter)

app.use('/', createProxyMiddleware({
  target: 'https://api.mangadex.org/',
  changeOrigin: true,
  onProxyRes: (proxyRes, req, res) => {
    delete proxyRes.headers['Access-Control-Allow-Origin']
    proxyRes.headers['Access-Control-Allow-Origin'] = '*'
  }
}))

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})