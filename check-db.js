const { Pool } = require('pg');

async function checkDatabase() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'arafat',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'math_club'
  });

  try {
    const client = await pool.connect();
    
    const result = await client.query('SELECT user_id, user_type, full_name, email FROM users');
    console.log('Users in database:');
    console.log(result.rows);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDatabase();
