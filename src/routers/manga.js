const express = require('express')
const { query } = require('../db')
const { convertToMangaDexFormat } = require('../utils')

const router = express.Router()

router.get('/', async (req, res) => {
  // try {
  //   const { limit = 10, skip = 0 } = req.query
  //   const result = await query(
  //     'SELECT manga_id, title, artist, author, description, rating_bayesian, views, mainCover '
  //   + 'FROM manga ORDER BY title LIMIT $1 OFFSET $2',
  //     [limit, skip]
  //   )
  //   res.send(result.rows.map((row) => convertToMangaDexFormat(row)))
  // } catch (e) {
  //   res.status(400).send(e)
  // }
  const { limit = 10, skip = 0 } = req.query
  const result = await query(
    'SELECT manga_id, title, artist, author, description, rating_bayesian, views, mainCover '
    + 'FROM manga ORDER BY title LIMIT $1 OFFSET $2',
    [limit, skip]
  )
  res.send(result.rows.map((row) => convertToMangaDexFormat(row)))
})

router.get('/search', async (req, res) => {
  try {
    const { q: searchQuery, nsfw, limit = 10, skip = 0 } = req.query
    const searchStatement =
      `SELECT manga_id, title, artist, author, description, rating_bayesian, views, mainCover, COUNT(*) OVER() AS count `
      + `FROM manga `
      + `WHERE textsearchable_index_col @@ plainto_tsquery($1) `
      + `${nsfw === 'true' ? '' : 'AND ishentai = false '}`
      + `ORDER BY ts_rank_cd(textsearchable_index_col, plainto_tsquery($1)) DESC `
      + `LIMIT $2 OFFSET $3`

    const searchResult = await query(searchStatement, [searchQuery, limit, skip])
    const formattedResults = searchResult.rows.map((row) => convertToMangaDexFormat(row))
    const count = formattedResults.length > 0 ? parseInt(formattedResults[0].count) : 0
    res.send({ results: formattedResults, count })
  } catch (e) {
    res.status(400).send(e)
  }
})

module.exports = router