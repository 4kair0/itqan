// Fix DB constraints via node-postgres
const { Client } = require('pg')

const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
})

const fixes = [
  { sql: 'ALTER TABLE learning_paths ALTER COLUMN created_by DROP NOT NULL', desc: 'learning_paths.created_by → nullable' },
  { sql: 'ALTER TABLE competitions ALTER COLUMN created_by DROP NOT NULL', desc: 'competitions.created_by → nullable' },
  { sql: 'ALTER TABLE fiqh_questions ALTER COLUMN asked_by DROP NOT NULL', desc: 'fiqh_questions.asked_by → nullable' },
  { sql: 'ALTER TABLE halaqat ALTER COLUMN teacher_id DROP NOT NULL', desc: 'halaqat.teacher_id → nullable' },
  { sql: 'ALTER TABLE announcements ALTER COLUMN title_en DROP NOT NULL', desc: 'announcements.title_en → nullable' },
  { sql: 'ALTER TABLE announcements ALTER COLUMN content_en DROP NOT NULL', desc: 'announcements.content_en → nullable' },
]

async function run() {
  await client.connect()
  console.log('✔ Connected to Supabase DB\n')

  for (const { sql, desc } of fixes) {
    try {
      await client.query(sql)
      console.log(`✔ Fixed: ${desc}`)
    } catch (e) {
      if (e.message.includes('does not exist') || e.message.includes('column') && e.message.includes('nullable')) {
        console.log(`⚠ Skip (already nullable): ${desc}`)
      } else {
        console.log(`✘ Error on ${desc}: ${e.message}`)
      }
    }
  }

  await client.end()
  console.log('\n✔ Done! All constraints fixed.')
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1) })
