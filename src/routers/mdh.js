const axios = require('../axios-config');
const express = require('express')
const router = express.Router()

router.get('/:chapterId', async (req, res) => {
  try {
    const { chapterId } = req.params
    const mdhRequest = axios.get(`/at-home/server/${chapterId}`)
    const chapterRequest = axios.get(`/chapter/${chapterId}`)
    
    const [mdhResponse, chapterResponse] = await Promise.all([mdhRequest, chapterRequest])
    const { baseUrl } = mdhResponse.data
    const { data: { data: { attributes: { hash, data, dataSaver: pages } } } } = chapterResponse

    const pageURLs = pages.map(
      (page) => `${baseUrl}/data-saver/${hash}/${page}`
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