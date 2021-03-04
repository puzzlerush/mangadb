const express = require('express')
const cors = require('cors')
const { query } = require('./db')

const port = process.env.PORT

const app = express()

app.use(cors())

app.get('/manga', async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query
    const result = await query(
      'SELECT manga_id, title, artist, author, description, views, mainCover '
    + 'FROM manga ORDER BY title LIMIT $1 OFFSET $2',
      [limit, skip]
    )
    res.send(result.rows)
  } catch (e) {
    res.status(400).send(e)
  }
})

app.get('/manga/search', async (req, res) => {
  const searchStatement =
    `SELECT manga_id, title, artist, author, description, rating_bayesian, views, mainCover `
  + `FROM manga `
  + `WHERE textsearchable_index_col @@ plainto_tsquery($1) `
  + `ORDER BY ts_rank_cd(textsearchable_index_col, plainto_tsquery($1)) DESC `
  + `LIMIT $2 OFFSET $3`
  const countStatement =
    `SELECT COUNT(*) as count `
  + `FROM manga `
  + `WHERE textsearchable_index_col @@ plainto_tsquery($1)`
  try {
    const { q: searchQuery, limit = 10, skip = 0 } = req.query
    const searchResult = await query(searchStatement, [searchQuery, limit, skip])
    const countResult = await query(countStatement, [searchQuery])
    const formattedResults = searchResult.rows.map((row) => convertToMangaDexFormat(row))
    res.send({ results: formattedResults, count: parseInt(countResult.rows[0].count) })
  } catch (e) {
    res.status(400).send(e)
  }
})

const convertToMangaDexFormat = (result) => {
  const converted = { ...result }
  delete converted.manga_id
  converted.id = result.manga_id
  delete converted.rating_bayesian
  converted.rating = { bayesian: result.rating_bayesian }
  delete converted.maincover
  converted.mainCover = result.maincover
  return converted
}; 

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})