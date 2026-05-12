import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'parent') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const conversations = await query<{
    id: string
    teacher_id: string
    teacher_name: string
    teacher_email: string
    child_id: string
    child_name: string
    subject: string
    last_message: string | null
    last_message_at: string | null
    unread_count_parent: number
    created_at: string
  }>(
    `SELECT ptc.id, ptc.teacher_id,
            t.name AS teacher_name, t.email AS teacher_email,
            ptc.child_id,
            c.name AS child_name,
            ptc.subject,
            ptc.last_message,
            ptc.last_message_at,
            ptc.unread_count_parent,
            ptc.created_at
     FROM parent_teacher_conversations ptc
     JOIN users t ON t.id = ptc.teacher_id
     JOIN users c ON c.id = ptc.child_id
     WHERE ptc.parent_id = $1
     ORDER BY COALESCE(ptc.last_message_at, ptc.created_at) DESC`,
    [session.sub]
  )

  return NextResponse.json({ conversations })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'parent') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const body = await req.json()
  const { teacher_id, child_id, subject, message } = body

  if (!teacher_id || !child_id || !subject) {
    return NextResponse.json({ error: 'المعلم والابن والموضوع مطلوبين' }, { status: 400 })
  }

  const link = await queryOne<{ id: string }>(
    `SELECT id FROM parent_children WHERE parent_id = $1 AND child_id = $2 AND status = 'active'`,
    [session.sub, child_id]
  )
  if (!link) {
    return NextResponse.json({ error: 'هذا الابن غير مربوط بحسابك' }, { status: 403 })
  }

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM parent_teacher_conversations
     WHERE parent_id = $1 AND teacher_id = $2 AND child_id = $3`,
    [session.sub, teacher_id, child_id]
  )
  if (existing) {
    return NextResponse.json({ error: 'محادثة موجودة بالفعل مع هذا المعلم', conversation_id: existing.id }, { status: 409 })
  }

  const conv = await queryOne<{ id: string }>(
    `INSERT INTO parent_teacher_conversations (parent_id, teacher_id, child_id, subject, last_message, last_message_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING id`,
    [session.sub, teacher_id, child_id, subject, message || null]
  )

  if (message && conv) {
    await query(
      `INSERT INTO parent_teacher_messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)`,
      [conv.id, session.sub, message]
    )
  }

  try {
    const parentName = await queryOne<{ name: string }>(`SELECT name FROM users WHERE id = $1`, [session.sub])
    await query(
      `INSERT INTO notifications (user_id, type, title, message, action_url, priority, category, related_user_id)
       VALUES ($1, 'parent_message', $2, $3, '/academy/teacher/messages', 'normal', 'communication', $4)`,
      [teacher_id, 'رسالة من ولي أمر', `أرسل ${parentName?.name || 'ولي أمر'} رسالة بخصوص: ${subject}`, session.sub]
    )
  } catch (e) {
    console.warn('[parent-conversations] notification insert failed:', e)
  }

  return NextResponse.json({ success: true, conversation_id: conv?.id })
}
