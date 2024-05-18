const { Pool } = require('pg');
const pool = new Pool({
  host: 'db',
  port: '5432',
  user: 'admin',
  password: 'pass123',
  database: 'text-learn'
});

module.exports = pool;