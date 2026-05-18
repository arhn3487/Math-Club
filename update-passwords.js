const { Pool } = require('pg');

async function updatePasswords() {
  const pool = new Pool({
    user: 'postgres',
    password: 'arafat',
    host: 'localhost',
    port: 5432,
    database: 'math_club'
  });

  try {
    const client = await pool.connect();
    
    const newHash = '$2a$10$6xMCHO8lNOlaY05SszUaj.xCf.JhudvkxVI1tY3gVifRPWNoPd3K2';
    
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE user_id IN ($2, $3)',
      [newHash, 'student_001', 'admin_001']
    );
    
    console.log('✓ Passwords updated successfully');
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updatePasswords();
