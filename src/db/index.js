const { Pool } = require('pg')
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
})

module.exports = {
  query: (statement, params) => {
    return pool.query(statement, params)
  }
}