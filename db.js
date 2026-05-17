const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
  if (err) {
    console.error('PostgreSQL lidhja dështoi:', err.message);
  } else {
    console.log('PostgreSQL u lidh me sukses');
  }
});

module.exports = pool;
