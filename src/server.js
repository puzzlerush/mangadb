const express = require('express')
const cors = require('cors')
const { query } = require('./db/index')

const port = process.env.PORT

const app = express()

app.use(cors())

app.get('/manga', async (req, res) => {
  try {
    const { limit, skip } = req.query
    const result = await query(
      'SELECT * FROM manga ORDER BY title LIMIT $1 OFFSET $2',
      [limit, skip]
    )
    res.send(result.rows)
  } catch (e) {
    res.status(400).send(e)
  }
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})