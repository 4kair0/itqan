import { Pool } from 'pg';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const columns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invitations'");
    console.log('Invitations Columns:', columns.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();
