const fs = require('fs')
const axios = require('axios')
const { query } = require('./index')

const stream = fs.createWriteStream('failed.txt', { flags: 'a' })

const fetchOne = async (i) => {
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
  } catch (e) {
    console.log(`Error saving manga with id ${i}: `, e.message)
    if (!(e.response && [404, 401, 403].includes(e.response.status))) {
      stream.write(i + ',')
    }
    if (e.response && e.response.status === 429) {
      console.log(`Reached API request limit at manga with id ${i}`)
      fs.writeFileSync('limit.txt', `Reached API request limit at manga with id ${i}`)
      return
    }
  }
};

const fetchData = async () => {
  for (let i = 60001; i <= 62800; i += 1) {
    await fetchOne(i);
  }
};

const retryFailed = async () => {
  const failedString = fs.readFileSync('failed_from_50001_to_60000.txt', 'utf8')
  const failedArray = failedString.split(',').map((failedID) => parseInt(failedID))
  for (const i of failedArray) {
    await fetchOne(i)
  }
}

// fetchData();
retryFailed();