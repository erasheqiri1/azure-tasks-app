const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/azure_tasks',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.connect((err) => {
  if (err) {
    console.error('PostgreSQL lidhja dështoi:', err.message);
  } else {
    console.log('PostgreSQL u lidh me sukses');
  }
});

module.exports = pool;
