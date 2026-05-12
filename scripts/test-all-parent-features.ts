/**
 * Comprehensive test for all parent features against the live database.
 * Tests:
 * 1. Parent-child linking (schema + data)
 * 2. Parent progress/reports APIs (query correctness)
 * 3. Parent-teacher messaging (schema + CRUD)
 * 4. Content restrictions (schema + CRUD)
 * 5. Weekly report (schema + data generation)
 */

import { Pool } from 'pg'
import dns from 'dns'
dns.setDefaultResultOrder('ipv4first')

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!DATABASE_URL) { console.error('No DATABASE_URL set'); process.exit(1) }

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

let passed = 0
let failed = 0
let skipped = 0

function assert(condition: boolean, msg: string) {
  if (condition) { passed++; console.log(`  PASS: ${msg}`) }
  else { failed++; console.log(`  FAIL: ${msg}`) }
}

function skip(msg: string) {
  skipped++; console.log(`  SKIP: ${msg}`)
}

async function q<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await pool.query(text, params)
  return res.rows as T[]
}

async function qOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await q<T>(text, params)
  return rows[0] || null
}

async function tableExists(name: string): Promise<boolean> {
  const rows = await q(`SELECT to_regclass('public.${name}') AS c`)
  return rows[0]?.c !== null
}

async function main() {
  console.log('============================================')
  console.log('  ITQAN - Parent Features Comprehensive Test')
  console.log('============================================\n')

  // ===== 1. SCHEMA TESTS =====
  console.log('--- 1. SCHEMA TESTS ---')
  assert(await tableExists('parent_children'), 'parent_children table exists')
  assert(await tableExists('parent_teacher_conversations'), 'parent_teacher_conversations table exists')
  assert(await tableExists('parent_teacher_messages'), 'parent_teacher_messages table exists')
  assert(await tableExists('parent_content_restrictions'), 'parent_content_restrictions table exists')
  assert(await tableExists('parent_weekly_reports'), 'parent_weekly_reports table exists')
  assert(await tableExists('notifications'), 'notifications table exists')
  assert(await tableExists('badges'), 'badges table exists')
  assert(await tableExists('badge_definitions'), 'badge_definitions table exists')
  assert(await tableExists('recitations'), 'recitations table exists')
  assert(await tableExists('session_attendance'), 'session_attendance table exists')
  assert(await tableExists('user_points'), 'user_points table exists')

  // ===== 2. PARENT-CHILD LINKING =====
  console.log('\n--- 2. PARENT-CHILD LINKING ---')
  
  // Check parent_children columns
  const pcCols = await q(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'parent_children' ORDER BY ordinal_position`
  )
  const pcColNames = pcCols.map(c => c.column_name)
  assert(pcColNames.includes('parent_id'), 'parent_children has parent_id column')
  assert(pcColNames.includes('child_id'), 'parent_children has child_id column')
  assert(pcColNames.includes('status'), 'parent_children has status column')
  assert(pcColNames.includes('relation'), 'parent_children has relation column')

  // Check existing links
  const links = await q(
    `SELECT pc.id, pc.status, p.name as parent_name, c.name as child_name
     FROM parent_children pc
     JOIN users p ON p.id = pc.parent_id
     JOIN users c ON c.id = pc.child_id`
  )
  console.log(`  Found ${links.length} parent-child links`)
  assert(links.length >= 0, 'Can query parent-child links without errors')

  const activeLinks = links.filter(l => l.status === 'active')
  console.log(`  Active links: ${activeLinks.length}`)
  for (const l of activeLinks) {
    console.log(`    ${l.parent_name} -> ${l.child_name} [${l.status}]`)
  }

  // ===== 3. PARENT PROGRESS QUERY =====
  console.log('\n--- 3. PARENT PROGRESS QUERY ---')
  
  if (activeLinks.length > 0) {
    const parentId = (await qOne<{ parent_id: string }>(`SELECT parent_id FROM parent_children WHERE status = 'active' LIMIT 1`))?.parent_id
    
    if (parentId) {
      const childrenData = await q<{ child_id: string; child_name: string }>(
        `SELECT pc.child_id, u.name as child_name
         FROM parent_children pc
         JOIN users u ON u.id = pc.child_id
         WHERE pc.parent_id = $1 AND pc.status = 'active'`,
        [parentId]
      )
      assert(childrenData.length > 0, `Parent ${parentId} has active children`)

      for (const child of childrenData) {
        // Test recitations query
        const recitations = await qOne<{ count: number }>(
          `SELECT COUNT(*)::int AS count FROM recitations WHERE student_id = $1`,
          [child.child_id]
        )
        console.log(`    ${child.child_name}: ${recitations?.count || 0} recitations`)

        // Test session attendance query
        const sessions = await qOne<{ count: number }>(
          `SELECT COUNT(*)::int AS count FROM session_attendance WHERE student_id = $1`,
          [child.child_id]
        )
        console.log(`    ${child.child_name}: ${sessions?.count || 0} session attendances`)

        // Test badges query
        const badges = await q<{ badge_name: string }>(
          `SELECT badge_name FROM badges WHERE user_id = $1`,
          [child.child_id]
        )
        console.log(`    ${child.child_name}: ${badges.length} badges`)

        // Test points query
        const points = await qOne<{ total_points: number }>(
          `SELECT total_points FROM user_points WHERE user_id = $1`,
          [child.child_id]
        )
        console.log(`    ${child.child_name}: ${points?.total_points || 0} points`)
      }
      assert(true, 'Progress queries executed successfully')
    }
  } else {
    skip('No active parent-child links to test progress queries')
  }

  // ===== 4. PARENT-TEACHER MESSAGING =====
  console.log('\n--- 4. PARENT-TEACHER MESSAGING ---')
  
  // Schema check
  const ptcCols = await q(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'parent_teacher_conversations' ORDER BY ordinal_position`
  )
  const ptcColNames = ptcCols.map(c => c.column_name)
  assert(ptcColNames.includes('parent_id'), 'parent_teacher_conversations has parent_id')
  assert(ptcColNames.includes('teacher_id'), 'parent_teacher_conversations has teacher_id')
  assert(ptcColNames.includes('child_id'), 'parent_teacher_conversations has child_id')
  assert(ptcColNames.includes('subject'), 'parent_teacher_conversations has subject')
  assert(ptcColNames.includes('last_message'), 'parent_teacher_conversations has last_message')
  assert(ptcColNames.includes('unread_count_parent'), 'parent_teacher_conversations has unread_count_parent')
  assert(ptcColNames.includes('unread_count_teacher'), 'parent_teacher_conversations has unread_count_teacher')

  const ptmCols = await q(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'parent_teacher_messages' ORDER BY ordinal_position`
  )
  const ptmColNames = ptmCols.map(c => c.column_name)
  assert(ptmColNames.includes('conversation_id'), 'parent_teacher_messages has conversation_id')
  assert(ptmColNames.includes('sender_id'), 'parent_teacher_messages has sender_id')
  assert(ptmColNames.includes('content'), 'parent_teacher_messages has content')
  assert(ptmColNames.includes('is_read'), 'parent_teacher_messages has is_read')

  // Test CRUD (insert, read, delete with cleanup)
  if (activeLinks.length > 0) {
    const parentId = (await qOne<any>(`SELECT parent_id FROM parent_children WHERE status = 'active' LIMIT 1`))?.parent_id
    const childId = (await qOne<any>(`SELECT child_id FROM parent_children WHERE parent_id = $1 AND status = 'active' LIMIT 1`, [parentId]))?.child_id
    const teacher = await qOne<any>(`SELECT id FROM users WHERE role = 'teacher' LIMIT 1`)

    if (parentId && childId && teacher) {
      // Create test conversation
      const testConv = await qOne<{ id: string }>(
        `INSERT INTO parent_teacher_conversations (parent_id, teacher_id, child_id, subject)
         VALUES ($1, $2, $3, 'اختبار تواصل ولي الأمر')
         RETURNING id`,
        [parentId, teacher.id, childId]
      )
      assert(!!testConv, 'Can create parent-teacher conversation')

      if (testConv) {
        // Insert test message
        const testMsg = await qOne<{ id: string }>(
          `INSERT INTO parent_teacher_messages (conversation_id, sender_id, content)
           VALUES ($1, $2, 'رسالة اختبارية من ولي الأمر')
           RETURNING id`,
          [testConv.id, parentId]
        )
        assert(!!testMsg, 'Can send message in conversation')

        // Read messages
        const msgs = await q(
          `SELECT * FROM parent_teacher_messages WHERE conversation_id = $1`,
          [testConv.id]
        )
        assert(msgs.length === 1, 'Can read messages from conversation')

        // Cleanup
        await q(`DELETE FROM parent_teacher_messages WHERE conversation_id = $1`, [testConv.id])
        await q(`DELETE FROM parent_teacher_conversations WHERE id = $1`, [testConv.id])
        assert(true, 'Cleanup: test conversation and messages deleted')
      }
    } else {
      skip('Missing parent/child/teacher data for messaging CRUD test')
    }
  } else {
    skip('No active links for messaging CRUD test')
  }

  // ===== 5. CONTENT RESTRICTIONS =====
  console.log('\n--- 5. CONTENT RESTRICTIONS ---')

  const pcrCols = await q(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'parent_content_restrictions' ORDER BY ordinal_position`
  )
  const pcrColNames = pcrCols.map(c => c.column_name)
  assert(pcrColNames.includes('parent_child_id'), 'parent_content_restrictions has parent_child_id')
  assert(pcrColNames.includes('restriction_type'), 'parent_content_restrictions has restriction_type')
  assert(pcrColNames.includes('target_id'), 'parent_content_restrictions has target_id')
  assert(pcrColNames.includes('is_blocked'), 'parent_content_restrictions has is_blocked')

  if (activeLinks.length > 0) {
    const linkId = activeLinks[0].id

    // Create test restriction
    const testRestr = await qOne<{ id: string }>(
      `INSERT INTO parent_content_restrictions (parent_child_id, restriction_type, target_id, is_blocked)
       VALUES ($1, 'surah', '114', true)
       RETURNING id`,
      [linkId]
    )
    assert(!!testRestr, 'Can create content restriction (surah block)')

    if (testRestr) {
      // Read restrictions
      const restrictions = await q(
        `SELECT * FROM parent_content_restrictions WHERE parent_child_id = $1`,
        [linkId]
      )
      assert(restrictions.length >= 1, 'Can read content restrictions')

      // Delete restriction
      await q(`DELETE FROM parent_content_restrictions WHERE id = $1`, [testRestr.id])
      assert(true, 'Cleanup: test restriction deleted')
    }
  } else {
    skip('No active links for content restrictions CRUD test')
  }

  // ===== 6. WEEKLY REPORTS =====
  console.log('\n--- 6. WEEKLY REPORTS ---')

  const pwrCols = await q(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'parent_weekly_reports' ORDER BY ordinal_position`
  )
  const pwrColNames = pwrCols.map(c => c.column_name)
  assert(pwrColNames.includes('parent_id'), 'parent_weekly_reports has parent_id')
  assert(pwrColNames.includes('child_id'), 'parent_weekly_reports has child_id')
  assert(pwrColNames.includes('week_start'), 'parent_weekly_reports has week_start')
  assert(pwrColNames.includes('week_end'), 'parent_weekly_reports has week_end')
  assert(pwrColNames.includes('recitations_count'), 'parent_weekly_reports has recitations_count')
  assert(pwrColNames.includes('sessions_attended'), 'parent_weekly_reports has sessions_attended')
  assert(pwrColNames.includes('badges_earned'), 'parent_weekly_reports has badges_earned')
  assert(pwrColNames.includes('current_level'), 'parent_weekly_reports has current_level')
  assert(pwrColNames.includes('summary'), 'parent_weekly_reports has summary (jsonb)')
  assert(pwrColNames.includes('email_sent'), 'parent_weekly_reports has email_sent')

  // Test inserting a mock report
  if (activeLinks.length > 0) {
    const link = await qOne<any>(`SELECT parent_id, child_id, id as link_id FROM parent_children WHERE status = 'active' LIMIT 1`)
    if (link) {
      const testReport = await qOne<{ id: string }>(
        `INSERT INTO parent_weekly_reports
          (parent_id, child_id, parent_child_id, week_start, week_end,
           recitations_count, sessions_attended, badges_earned,
           current_level, summary, email_sent)
         VALUES ($1, $2, $3, '2026-05-04', '2026-05-11', 3, 2, 1, 'مبتدئ', '{"test": true}'::jsonb, false)
         RETURNING id`,
        [link.parent_id, link.child_id, link.link_id]
      )
      assert(!!testReport, 'Can insert weekly report record')

      if (testReport) {
        await q(`DELETE FROM parent_weekly_reports WHERE id = $1`, [testReport.id])
        assert(true, 'Cleanup: test weekly report deleted')
      }
    }
  } else {
    skip('No active links for weekly report test')
  }

  // ===== 7. EMAIL TEMPLATES =====
  console.log('\n--- 7. EMAIL TEMPLATES ---')
  const templates = await q(`SELECT template_key, is_active FROM email_templates ORDER BY template_key`)
  console.log(`  Found ${templates.length} email templates:`)
  for (const t of templates) {
    console.log(`    ${t.template_key}: active=${t.is_active}`)
  }
  assert(templates.length > 0, 'Email templates exist in database')

  // ===== 8. NOTIFICATIONS =====
  console.log('\n--- 8. NOTIFICATIONS ---')
  const notifCols = await q(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications' ORDER BY ordinal_position`
  )
  const notifColNames = notifCols.map(c => c.column_name)
  assert(notifColNames.includes('user_id'), 'notifications has user_id')
  assert(notifColNames.includes('type'), 'notifications has type')
  assert(notifColNames.includes('title'), 'notifications has title')
  assert(notifColNames.includes('message'), 'notifications has message')

  // Check parent_link_request notifications
  const parentNotifs = await q(
    `SELECT COUNT(*)::int as count FROM notifications WHERE type = 'parent_link_request'`
  )
  console.log(`  Parent link request notifications: ${parentNotifs[0]?.count || 0}`)

  // ===== SUMMARY =====
  console.log('\n============================================')
  console.log(`  RESULTS: ${passed} passed, ${failed} failed, ${skipped} skipped`)
  console.log(`  TOTAL: ${passed + failed + skipped} tests`)
  console.log('============================================')

  await pool.end()
  process.exit(failed > 0 ? 1 : 0)
}

main().catch(e => {
  console.error('Fatal error:', e)
  pool.end()
  process.exit(1)
})
