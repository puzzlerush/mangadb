const axios = require('../axios-config');
const express = require('express')
const router = express.Router()

router.get('/:imageUrl', async (req, res) => {
  try {
    const imageUrl = decodeURIComponent(req.params.imageUrl)
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const imageBuffer = Buffer.from(response.data, 'binary')
    res.writeHead(200, {
      'Content-Type': 'image/jpg',
      'Content-Length': imageBuffer.length
    })
    res.end(imageBuffer, 'binary')
  } catch (e) {
    res.status(400).send(e)
  }
})

module.exports = router
