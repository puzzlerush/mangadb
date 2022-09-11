const axios = require('../axios-config');
const express = require('express')
const router = express.Router()

router.get('/:chapterId', async (req, res) => {
  try {
    const { chapterId } = req.params
    const lowRes = req.query.lowRes === 'true'

    const mdhResponse = await axios.get(`/at-home/server/${chapterId}`)
    const { baseUrl, chapter: { hash, data, dataSaver } } = mdhResponse.data
    const pages = lowRes === true ? dataSaver : data

    const pageURLs = pages.map(
      (page) => `${baseUrl}/${lowRes === true ? 'data-saver' : 'data'}/${hash}/${page}`
    );

    const imageBuffers = await Promise.all(
      pageURLs.map((url) =>
        axios
          .get(url, {
            responseType: 'arraybuffer',
          })
          .then((response) =>
            Buffer.from(response.data, 'binary').toString('base64')
          )
      )
    );

    res.json(imageBuffers)
  } catch (e) {
    res.status(400).send(e)
  }
  
})

module.exports = router