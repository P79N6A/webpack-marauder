let axios = require('axios')
let qs = require('qs')

let formAxios = axios.create({
  transformRequest: [
    function(data) {
      data = qs.stringify(data)
      return data
    }
  ],
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})

module.exports = formAxios
