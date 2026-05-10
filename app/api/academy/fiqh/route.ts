import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import { pickOfficerForCategory } from '@/lib/fiqh-helpers'
import { createNotification } from '@/lib/notifications'

// GET ?view=mine|inbox|library
//   mine    -> questions asked by me (asker)
//   inbox   -> questions assigned to me (officer)
//   library -> default; published only (public if not logged in via ?public=1)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const view = searchParams.get('view') || 'library'
  const isPublic = searchParams.get('public') === '1' || view === 'library'
  const session = await getSession()

  if (!isPublic && !session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  if (view === 'mine') {
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    const rows = await query(
      `SELECT q.id, q.title, q.question, q.answer, q.category_id, q.status,
              q.publish_consent, q.publish_consent_requested_at, q.is_anonymous,
              q.is_published, q.published_at,
              q.asked_at, q.answered_at,
              c.name_ar AS category_name_ar, c.slug AS category_slug,
              ou.name AS officer_name
         FROM fiqh_questions q
         LEFT JOIN fiqh_categories c ON c.id = q.category_id
         LEFT JOIN users ou         ON ou.id = q.assigned_to
        WHERE q.asked_by = $1
        ORDER BY q.asked_at DESC`,
      [session!.sub]
    )
    return NextResponse.json({ questions: rows })
  }

  if (view === 'inbox') {
    if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    const rows = await query(
      `SELECT q.id, q.title, q.question, q.answer, q.category_id, q.status,
              q.publish_consent, q.is_anonymous, q.is_published, q.published_at,
              q.asked_at, q.answered_at,
              c.name_ar AS category_name_ar, c.slug AS category_slug,
              CASE WHEN q.is_anonymous THEN NULL ELSE u.name END AS asker_name
         FROM fiqh_questions q
         LEFT JOIN fiqh_categories c ON c.id = q.category_id
         JOIN users u ON u.id = q.asked_by
        WHERE q.assigned_to = $1
        ORDER BY
          CASE q.status
            WHEN 'assigned'         THEN 1
            WHEN 'in_progress'      THEN 2
            WHEN 'awaiting_consent' THEN 3
            WHEN 'published'        THEN 4
            ELSE 5
          END,
          q.asked_at DESC`,
      [session!.sub]
    )
    return NextResponse.json({ questions: rows })
  }

  // Library: published only
  const search = (searchParams.get('q') || '').trim()
  const categorySlug = searchParams.get('category')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)

  const where: string[] = ['q.is_published = TRUE', "q.status = 'published'"]
  const values: any[] = []
  if (search) {
    values.push(`%${search}%`)
    where.push(`(q.question ILIKE $${values.length} OR q.answer ILIKE $${values.length} OR q.title ILIKE $${values.length})`)
  }
  if (categorySlug) {
    values.push(categorySlug)
    where.push(`c.slug = $${values.length}`)
  }
  values.push(limit)

  const rows = await query(
    `SELECT q.id, q.title, q.question, q.answer, q.category_id, q.is_anonymous,
            q.published_at, q.views_count,
            c.name_ar AS category_name_ar, c.slug AS category_slug,
            CASE WHEN q.is_anonymous THEN NULL ELSE u.name END AS asker_name,
            ou.name AS officer_name
       FROM fiqh_questions q
       LEFT JOIN fiqh_categories c ON c.id = q.category_id
       LEFT JOIN users u           ON u.id = q.asked_by
       LEFT JOIN users ou          ON ou.id = q.assigned_to
      WHERE ${where.join(' AND ')}
      ORDER BY q.published_at DESC NULLS LAST
      LIMIT $${values.length}`,
    values
  )
  return NextResponse.json({ questions: rows })
}

// POST: submit a new question (logged-in user)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول لإرسال سؤال' }, { status: 401 })
  }

  const body = await req.json()
  const { title, question, category_id, is_anonymous } = body
  if (!question || typeof question !== 'string' || question.trim().length < 5) {
    return NextResponse.json({ error: 'يرجى كتابة نص السؤال (5 أحرف على الأقل)' }, { status: 400 })
  }
  if (!category_id) {
    return NextResponse.json({ error: 'يرجى اختيار التصنيف' }, { status: 400 })
  }

  const cat = await queryOne<{ id: string; slug: string; name_ar: string }>(
    `SELECT id, slug, name_ar FROM fiqh_categories WHERE id = $1 AND is_active = TRUE`,
    [category_id]
  )
  if (!cat) {
    return NextResponse.json({ error: 'تصنيف غير صالح' }, { status: 400 })
  }

  // Try to auto-assign to a registered officer for this category
  const officer = await pickOfficerForCategory(cat.id)
  const status = officer ? 'assigned' : 'pending'

  const inserted = await query<{ id: string }>(
    `INSERT INTO fiqh_questions
       (asked_by, title, question, category, category_id, is_anonymous,
        assigned_to, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      session.sub,
      (title || '').slice(0, 240) || null,
      question.trim(),
      cat.slug, // keep legacy varchar column populated
      cat.id,
      is_anonymous === true,
      officer?.user_id ?? null,
      status,
    ]
  )

  const qid = inserted[0]?.id
  if (!qid) {
    return NextResponse.json({ error: 'فشل في حفظ السؤال' }, { status: 500 })
  }

  // Notify officer (if assigned)
  if (officer) {
    await createNotification({
      userId: officer.user_id,
      type: 'general',
      category: 'fiqh',
      title: 'سؤال فقهي جديد',
      message: `تم تعيين سؤال جديد لك في تصنيف ${cat.name_ar}.`,
      link: `/academy/officer/fiqh/${qid}`,
    })
  } else {
    // No officer in this category — alert admins
    const admins = await query<{ id: string }>(
      `SELECT id FROM users WHERE role IN ('admin','academy_admin') LIMIT 25`
    )
    for (const a of admins) {
      await createNotification({
        userId: a.id,
        type: 'general',
        category: 'fiqh',
        title: 'سؤال فقهي بدون مسؤول',
        message: `سؤال جديد في تصنيف ${cat.name_ar} يحتاج تعيين مسؤول.`,
        link: `/academy/admin/fiqh`,
      })
    }
  }

  return NextResponse.json({
    success: true,
    question_id: qid,
    assigned: !!officer,
    officer_name: officer?.user_name ?? null,
  })
}
