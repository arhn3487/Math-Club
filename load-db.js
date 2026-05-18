const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function loadDatabase() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'math_club'
  });

  try {
    console.log('Connecting to PostgreSQL...');
    const client = await pool.connect();
    console.log('✓ Connected to math_club database');

    const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    console.log('Loading database schema...');
    
    await client.query(sql);
    console.log('✓ Database schema loaded successfully');
    
    client.release();
    await pool.end();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('✗ Error loading database:');
    console.error(error.message);
    process.exit(1);
  }
}

loadDatabase();
