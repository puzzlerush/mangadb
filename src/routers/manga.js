const express = require('express')
const { query } = require('../db')
const { convertToMangaDexFormat } = require('../utils')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query
    const result = await query(
      'SELECT manga_id, title, artist, author, description, rating_bayesian, views, mainCover '
    + 'FROM manga ORDER BY title LIMIT $1 OFFSET $2',
      [limit, skip]
    )
    res.send(result.rows.map((row) => convertToMangaDexFormat(row)))
  } catch (e) {
    res.status(400).send(e)
  }
})

router.get('/search', async (req, res) => {
  const searchStatement =
    `SELECT manga_id, title, artist, author, description, rating_bayesian, views, mainCover, COUNT(*) OVER() AS count `
  + `FROM manga `
  + `WHERE textsearchable_index_col @@ plainto_tsquery($1) `
  + `ORDER BY ts_rank_cd(textsearchable_index_col, plainto_tsquery($1)) DESC `
  + `LIMIT $2 OFFSET $3`
  try {
    const { q: searchQuery, limit = 10, skip = 0 } = req.query
    const searchResult = await query(searchStatement, [searchQuery, limit, skip])
    const formattedResults = searchResult.rows.map((row) => convertToMangaDexFormat(row))
    res.send({ results: formattedResults, count: parseInt(formattedResults[0].count) })
  } catch (e) {
    res.status(400).send(e)
  }
})

module.exports = router