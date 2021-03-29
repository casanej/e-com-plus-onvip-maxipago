const axios = require('axios')

module.exports = (vindiApiKey, isSandbox) => {
  // https://vindi.github.io/api-docs/dist/
  return axios.create({
    baseURL: `https://api.maxipago.net/UniversalAPI/postXML`,
    headers: {
      'Content-Type': 'text/xml'
    }
  })
}
