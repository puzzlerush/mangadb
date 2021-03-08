const express = require('express')
const { query } = require('../db')
const { convertToMangaDexFormat } = require('../utils')

const router = express.Router()

const selectFields = 'SELECT manga_id, title, artist, author, description, rating_bayesian, views, mainCover '

router.get('/', async (req, res) => {
  const { sortby = 'title', ascending = 'true', limit = 10, skip = 0 } = req.query
  
  let orderByField;
  switch (sortby.toLowerCase()) {
    case 'views':
      orderByField = 'views'
      break;
    default:
      orderByField = 'title'
      break;
  }

  let orderByDirection;
  if (ascending === 'true') {
    orderByDirection = 'ASC'
  } else {
    orderByDirection = 'DESC'
  }

  const result = await query(
    selectFields
    + `FROM manga ORDER BY ${orderByField} ${orderByDirection} LIMIT $1 OFFSET $2`,
    [limit, skip]
  )
  res.send(result.rows.map((row) => convertToMangaDexFormat(row)))
})

router.get('/search', async (req, res) => {
  try {
    const { q: searchQuery, nsfw, limit = 10, skip = 0 } = req.query
    const searchStatement =
      `${selectFields}, COUNT(*) OVER() AS count `
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