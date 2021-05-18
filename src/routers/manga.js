const express = require('express')
const { query } = require('../db')
const { convertToMangaDexFormat } = require('../utils')

const router = express.Router()

const selectFields = 'SELECT mim.new_id manga_id, title, artist, author, description, rating_bayesian, views, mainCover, mal '

router.get('/', async (req, res) => {
  const { sortby = 'title', ascending = 'true', nsfw, limit = 10, skip = 0 } = req.query
  
  let orderByField
  switch (sortby.toLowerCase()) {
    case 'views':
      orderByField = 'views'
      break
    case 'rating':
      orderByField = 'rating_bayesian'
      break
    default:
      orderByField = 'title'
      break
  }

  let orderByDirection
  if (ascending === 'true') {
    orderByDirection = 'ASC'
  } else {
    orderByDirection = 'DESC'
  }
  
  const whereClause = `${nsfw === 'true' ? '' : 'WHERE ishentai = false '}`
  const result = await query(
    selectFields
    + `FROM manga `
    + `INNER JOIN manga_id_map mim ON manga.manga_id = mim.legacy_id `
    + whereClause
    + `ORDER BY ${orderByField} ${orderByDirection} LIMIT $1 OFFSET $2`,
    [limit, skip]
  )
  const countResult = await query(`SELECT COUNT(*) FROM manga ${whereClause}`)
  const formattedResults = result.rows.map((row) => convertToMangaDexFormat(row))
  res.send({ results: formattedResults, count: parseInt(countResult.rows[0].count) })
})

router.get('/search', async (req, res) => {
  try {
    const { q: searchQuery, nsfw, limit = 10, skip = 0 } = req.query
    
    const whereClause =
      `WHERE textsearchable_index_col @@ plainto_tsquery($1) `
      + `${nsfw === 'true' ? '' : 'AND ishentai = false '}`
    
    const searchStatement =
      selectFields
      + `FROM manga `
      + `INNER JOIN manga_id_map mim ON manga.manga_id = mim.legacy_id `
      + whereClause
      + `ORDER BY ts_rank_cd(textsearchable_index_col, plainto_tsquery($1)) DESC `
      + `LIMIT $2 OFFSET $3`

    const countStatement = `SELECT COUNT(*) FROM manga ${whereClause}`

    const searchResult = await query(searchStatement, [searchQuery, limit, skip])
    const countResult = await query(countStatement, [searchQuery])
    const formattedResults = searchResult.rows.map((row) => convertToMangaDexFormat(row))
    res.send({ results: formattedResults, count: parseInt(countResult.rows[0].count) })
  } catch (e) {
    res.status(400).send(e)
  }
})

module.exports = router