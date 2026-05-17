const { Pool } = require('pg');

const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/azure_tasks',
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

pool.connect((err) => {
  if (err) {
    console.error('PostgreSQL lidhja dështoi:', err.message);
  } else {
    console.log('PostgreSQL u lidh me sukses');
  }
});

module.exports = pool;
