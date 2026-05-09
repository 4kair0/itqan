import { Pool } from 'pg';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const columns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses'");
    console.log('Courses Columns:', columns.rows);
    
    const sample = await pool.query("SELECT * FROM courses LIMIT 1");
    console.log('Sample Course:', sample.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();
