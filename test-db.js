const db = require('./server/db');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('Database connected successfully:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Database connection failed!');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    console.error('Full Error:', err);
    process.exit(1);
  }
}

testConnection();
