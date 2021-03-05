const express = require('express')
const cors = require('cors')
const mangaRouter = require('./routers/manga')

const port = process.env.PORT

const app = express()

app.use(cors())

app.use('/manga', mangaRouter)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})