const config = {
  user: 'postgres',
  host: '10.210.210.140',
  database: 'mfe_engine',
  port: 5432,
  password: 'mara'
}

const { Client } = require('pg')

const client = new Client(config)

client.queryAsync = sql => {
  return new Promise((resolve, reject) => {
    client.query(sql, (err, res) => {
      if (err) {
        reject(err)
        return
      }
      resolve(res)
    })
  })
}

module.exports = client
