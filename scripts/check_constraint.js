const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL || '' });
client.connect().then(() => client.query("SELECT pg_get_constraintdef((SELECT oid FROM pg_constraint WHERE conname = 'invitations_status_check'));")).then(res => {
  console.log(res.rows[0].pg_get_constraintdef);
  client.end();
}).catch(console.error);
