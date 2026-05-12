import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'parent') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const conversationId = (await params).id

  const conv = await queryOne<{ id: string }>(
    `SELECT id FROM parent_teacher_conversations WHERE id = $1 AND parent_id = $2`,
    [conversationId, session.sub]
  )
  if (!conv) {
    return NextResponse.json({ error: 'المحادثة غير موجودة' }, { status: 404 })
  }

  const messages = await query<{
    id: string
    sender_id: string
    sender_name: string
    content: string
    is_read: boolean
    created_at: string
  }>(
    `SELECT m.id, m.sender_id, u.name AS sender_name, m.content, m.is_read, m.created_at
     FROM parent_teacher_messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = $1
     ORDER BY m.created_at ASC`,
    [conversationId]
  )

  await query(
    `UPDATE parent_teacher_messages SET is_read = TRUE
     WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE`,
    [conversationId, session.sub]
  )
  await query(
    `UPDATE parent_teacher_conversations SET unread_count_parent = 0 WHERE id = $1`,
    [conversationId]
  )

  return NextResponse.json({ messages })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'parent') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const conversationId = (await params).id
  const body = await req.json()
  const { content } = body

  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'محتوى الرسالة مطلوب' }, { status: 400 })
  }

  const conv = await queryOne<{ id: string; teacher_id: string }>(
    `SELECT id, teacher_id FROM parent_teacher_conversations WHERE id = $1 AND parent_id = $2`,
    [conversationId, session.sub]
  )
  if (!conv) {
    return NextResponse.json({ error: 'المحادثة غير موجودة' }, { status: 404 })
  }

  const msg = await queryOne<{ id: string; created_at: string }>(
    `INSERT INTO parent_teacher_messages (conversation_id, sender_id, content)
     VALUES ($1, $2, $3)
     RETURNING id, created_at`,
    [conversationId, session.sub, content.trim()]
  )

  await query(
    `UPDATE parent_teacher_conversations
     SET last_message = $2, last_message_at = NOW(),
         unread_count_teacher = unread_count_teacher + 1,
         updated_at = NOW()
     WHERE id = $1`,
    [conversationId, content.trim().substring(0, 200)]
  )

  return NextResponse.json({
    success: true,
    message: {
      id: msg?.id,
      sender_id: session.sub,
      content: content.trim(),
      is_read: false,
      created_at: msg?.created_at,
    },
  })
}
