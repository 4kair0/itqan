const { Client } = require('pg');
const conn = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!conn) { console.error('Set DATABASE_URL or POSTGRES_URL'); process.exit(1); }
const client = new Client({ connectionString: conn });
client.connect().then(() => client.query("SELECT pg_get_constraintdef((SELECT oid FROM pg_constraint WHERE conname = 'invitations_status_check'));")).then(res => {
  console.log(res.rows[0].pg_get_constraintdef);
  client.end();
}).catch(console.error);
