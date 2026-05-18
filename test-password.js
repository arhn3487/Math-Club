const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function testPassword() {
  const pool = new Pool({
    user: 'postgres',
    password: 'arafat',
    host: 'localhost',
    port: 5432,
    database: 'math_club'
  });

  try {
    const client = await pool.connect();
    
    const result = await client.query(
      'SELECT user_id, password_hash FROM users WHERE user_id = $1',
      ['student_001']
    );
    
    if (result.rows.length === 0) {
      console.log('User not found');
      return;
    }
    
    const user = result.rows[0];
    console.log('User:', user.user_id);
    console.log('Hash:', user.password_hash);
    
    const testPassword = 'password123';
    const match = await bcrypt.compare(testPassword, user.password_hash);
    console.log(`Does "${testPassword}" match hash?`, match);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPassword();
