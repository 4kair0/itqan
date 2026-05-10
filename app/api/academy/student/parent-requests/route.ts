import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

// GET: list pending parent link requests for the logged-in student
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const rows = await query<{
    id: string
    parent_id: string
    parent_name: string
    parent_email: string
    parent_avatar: string | null
    relation: string
    requested_at: string
    link_code_expires_at: string | null
  }>(
    `SELECT pc.id, pc.parent_id, u.name AS parent_name, u.email AS parent_email,
            u.avatar_url AS parent_avatar, pc.relation, pc.requested_at, pc.link_code_expires_at
     FROM parent_children pc
     JOIN users u ON u.id = pc.parent_id
     WHERE pc.child_id = $1 AND pc.status = 'pending'
     ORDER BY pc.requested_at DESC`,
    [session.sub]
  )

  return NextResponse.json({ requests: rows })
}

// POST: confirm or reject a pending request
// body: { id, action: 'confirm' | 'reject', code? }
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'student') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id, action, code } = await req.json()
  if (!id || !action) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  const link = await queryOne<{
    id: string
    parent_id: string
    child_id: string
    status: string
    link_code: string | null
    link_code_expires_at: string | null
  }>(
    `SELECT id, parent_id, child_id, status, link_code, link_code_expires_at
     FROM parent_children WHERE id = $1`,
    [id]
  )

  if (!link || link.child_id !== session.sub) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }
  if (link.status !== 'pending') {
    return NextResponse.json({ error: 'الطلب لم يعد معلقاً' }, { status: 400 })
  }

  if (action === 'confirm') {
    if (!code || code.toString().trim() !== (link.link_code || '').trim()) {
      return NextResponse.json({ error: 'كود التأكيد غير صحيح' }, { status: 400 })
    }
    if (link.link_code_expires_at && new Date(link.link_code_expires_at) < new Date()) {
      return NextResponse.json({ error: 'انتهت صلاحية الكود' }, { status: 400 })
    }

    await query(
      `UPDATE parent_children
       SET status = 'active', confirmed_at = NOW(), link_code = NULL,
           link_code_expires_at = NULL, updated_at = NOW()
       WHERE id = $1`,
      [id]
    )

    // Notify parent
    const child = await queryOne<{ name: string }>(`SELECT name FROM users WHERE id = $1`, [session.sub])
    await createNotification({
      userId: link.parent_id,
      type: 'general',
      title: 'تم قبول طلب الربط',
      message: `وافق ${child?.name || 'الطالب'} على ربط الحساب. يمكنك الآن متابعة تقدمه.`,
      category: 'account',
      link: '/academy/parent/children',
    })

    return NextResponse.json({ success: true })
  }

  if (action === 'reject') {
    await query(
      `UPDATE parent_children
       SET status = 'rejected', rejected_at = NOW(), link_code = NULL,
           link_code_expires_at = NULL, updated_at = NOW()
       WHERE id = $1`,
      [id]
    )

    const child = await queryOne<{ name: string }>(`SELECT name FROM users WHERE id = $1`, [session.sub])
    await createNotification({
      userId: link.parent_id,
      type: 'general',
      title: 'تم رفض طلب الربط',
      message: `رفض ${child?.name || 'الطالب'} طلب الربط.`,
      category: 'account',
      link: '/academy/parent/children',
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 })
}
