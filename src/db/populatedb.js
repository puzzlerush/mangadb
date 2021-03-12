const axios = require('axios')
const { query } = require('./index')

const fetchOne = async (i, download_id) => {
  try {
    const response = await axios.get(`https://api.mangadex.org/v2/manga/${i}`)
    const insertStatement =
      `INSERT INTO manga(`
      + `manga_id, title, altTitles, description, artist, `
      + `author, language, status, demographic, tags, `
      + `lastChapter, lastVolume, isHentai, mal, engtl, `
      + `relation_ids, relation_titles, relation_types, relation_isHentais, rating_bayesian, `
      + `rating_mean, rating_users, views, follows, comments, `
      + `lastUploaded, mainCover) `
      + `VALUES (`
      + `$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, `
      + `$11, $12, $13, $14, $15, $16, $17, $18, $19, $20, `
      + `$21, $22, $23, $24, $25, $26, $27) `
      + `RETURNING *`
    const {
      id, title, altTitles, description, artist,
      author, publication, tags, lastChapter, lastVolume,
      isHentai, links, relations, rating, views,
      follows, comments, lastUploaded, mainCover
    } = response.data.data

    const { language, status, demographic } = publication || {}
    const { mal, engtl } = links || {}
    const {
      bayesian: rating_bayesian,
      mean: rating_mean,
      users: rating_users
    } = rating || {}
    const relation_ids = []
    const relation_titles = []
    const relation_types = []
    const relation_isHentais = []
    relations.forEach((relation) => {
      relation_ids.push(relation.id)
      relation_titles.push(relation.title)
      relation_types.push(relation.type)
      relation_isHentais.push(relation.isHentai)
    })

    const result = await query(insertStatement, [
      id, title, altTitles, description, artist,
      author, language, status, demographic, tags,
      lastChapter, lastVolume, isHentai, mal, engtl,
      relation_ids, relation_titles, relation_types, relation_isHentais, rating_bayesian,
      rating_mean, rating_users, views, follows, comments,
      lastUploaded, mainCover
    ])
    console.log(`Successfully saved manga with id ${id}`)
    await query(
      'UPDATE downloads SET success = success || $1 WHERE id = $2',
      [[i], download_id]
    )
  } catch (e) {
    console.log(`Error saving manga with id ${i}: `, e.message)
    if (e.response && [404, 401, 403].includes(e.response.status)) {
      await query(
        'UPDATE downloads SET unknown = unknown || $1 WHERE id = $2',
        [[i], download_id]
      )
    } else {
      await query(
        'UPDATE downloads SET failed = failed || $1 WHERE id = $2',
        [[i], download_id]
      )
    }
  }
}

const updateDatabase = async () => {
  const select_last_download_id = await query('SELECT MAX(id) as max_id FROM downloads')
  const last_download_id = select_last_download_id.rows[0].max_id

  
  let start
  let failed = []
  if (!last_download_id) {
    const result = await query('SELECT MAX(manga_id) as max_id FROM manga')
    start = result.rows[0].max_id + 1
  } else {
    const select_last_download = await query(
      'SELECT * FROM downloads WHERE id = $1',
      [last_download_id]
    )
    start = select_last_download.rows[0].end_id + 1
    failed = select_last_download.rows[0].failed
  }
  const interval = 10
  const end = start + interval

  const insert_new_download = await query(
    'INSERT INTO downloads(start_id, end_id) VALUES ($1, $2) RETURNING id',
    [start, end]
  )

  const current_download_id = insert_new_download.rows[0].id

  for (const failed_id of failed) {
    await fetchOne(failed_id, current_download_id)
  }

  for (let i = start; i <= end; i += 1) {
    await fetchOne(i, current_download_id)
  }

}

updateDatabase()