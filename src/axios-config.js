const axios = require('axios');

const instance = axios.create({
  baseURL: 'https://api.mangadex.org'
});

module.exports = instance;