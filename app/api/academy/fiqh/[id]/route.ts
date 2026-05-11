import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import { canAccessQuestion } from '@/lib/fiqh-helpers'

// GET: fetch a question with thread (public if published & ?public=1; otherwise auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const wantPublic = searchParams.get('public') === '1'

  const q = await queryOne<{
    id: string
    asked_by: string
    title: string | null
    question: string
    answer: string | null
    category_id: string | null
    category_slug: string | null
    category_name_ar: string | null
    status: string
    publish_consent: string
    is_anonymous: boolean
    is_published: boolean
    published_at: string | null
    asked_at: string
    answered_at: string | null
    asker_name: string | null
    officer_name: string | null
    assigned_to: string | null
    views_count: number
  }>(
    `SELECT q.id, q.asked_by, q.title, q.question, q.answer, q.category_id,
            c.slug AS category_slug, c.name_ar AS category_name_ar,
            q.status, q.publish_consent, q.is_anonymous, q.is_published,
            q.published_at, q.asked_at, q.answered_at, q.assigned_to, q.views_count,
            CASE WHEN q.is_anonymous THEN NULL ELSE u.name END AS asker_name,
            ou.name AS officer_name
       FROM fiqh_questions q
       LEFT JOIN fiqh_categories c ON c.id = q.category_id
       LEFT JOIN users u           ON u.id = q.asked_by
       LEFT JOIN users ou          ON ou.id = q.assigned_to
      WHERE q.id = $1
      LIMIT 1`,
    [id]
  )
  if (!q) return NextResponse.json({ error: 'لم يُعثر على السؤال' }, { status: 404 })

  if (wantPublic) {
    if (!q.is_published || q.status !== 'published') {
      return NextResponse.json({ error: 'السؤال غير منشور' }, { status: 403 })
    }
    // bump views
    await query(`UPDATE fiqh_questions SET views_count = COALESCE(views_count,0) + 1 WHERE id = $1`, [id])
    return NextResponse.json({ question: q, messages: [] })
  }

  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const access = await canAccessQuestion(session.sub, session.role, id)
  if (!access.allowed) {
    return NextResponse.json({ error: 'لا تملك صلاحية الوصول' }, { status: 403 })
  }

  const messages = await query(
    `SELECT m.id, m.sender_id, m.sender_role, m.content, m.is_read, m.created_at,
            u.name AS sender_name, u.avatar_url AS sender_avatar
       FROM fiqh_messages m
       JOIN users u ON u.id = m.sender_id
      WHERE m.question_id = $1
      ORDER BY m.created_at ASC`,
    [id]
  )

  // mark messages addressed to me as read
  await query(
    `UPDATE fiqh_messages SET is_read = TRUE
      WHERE question_id = $1 AND sender_id <> $2 AND is_read = FALSE`,
    [id, session.sub]
  )

  return NextResponse.json({ question: q, messages, perspective: access.perspective })
}
