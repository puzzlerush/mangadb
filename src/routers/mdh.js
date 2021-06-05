const axios = require('../axios-config');
const express = require('express')
const router = express.Router()

router.get('/:chapterId', async (req, res) => {
  try {
    const { chapterId } = req.params
    const response = await axios.get(`/at-home/server/${chapterId}`);
    const { baseUrl } = response.data;
    const { data: { data: { attributes: { hash, data, dataSaver: pages } } } } = await axios.get(`/chapter/${chapterId}`)
    
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