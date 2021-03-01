const axios = require('axios')
const { query } = require('./index')

const fetchData = async () => {
  for (let i = 1; i <= 10; i += 1) {
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

      const { language, status, demographic } = publication
      const { mal, engtl } = links
      const { 
        bayesian: rating_bayesian, 
        mean: rating_mean, 
        users: rating_users 
      } = rating
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
    } catch (e) {
      console.log(e.message)
    }

  }
}

fetchData();