import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'parent') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get('child_id')

  if (!childId) {
    return NextResponse.json({ error: 'معرف الابن مطلوب' }, { status: 400 })
  }

  const link = await queryOne<{ id: string }>(
    `SELECT id FROM parent_children WHERE parent_id = $1 AND child_id = $2 AND status = 'active'`,
    [session.sub, childId]
  )
  if (!link) {
    return NextResponse.json({ error: 'هذا الابن غير مربوط بحسابك' }, { status: 403 })
  }

  const restrictions = await query<{
    id: string
    restriction_type: string
    target_id: string
    is_blocked: boolean
    created_at: string
  }>(
    `SELECT id, restriction_type, target_id, is_blocked, created_at
     FROM parent_content_restrictions
     WHERE parent_child_id = $1
     ORDER BY created_at DESC`,
    [link.id]
  )

  return NextResponse.json({ restrictions })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'parent') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const body = await req.json()
  const { child_id, restriction_type, target_id, is_blocked } = body

  if (!child_id || !restriction_type || !target_id) {
    return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
  }

  const allowedTypes = ['surah', 'path', 'course']
  if (!allowedTypes.includes(restriction_type)) {
    return NextResponse.json({ error: 'نوع التقييد غير صالح' }, { status: 400 })
  }

  const link = await queryOne<{ id: string }>(
    `SELECT id FROM parent_children WHERE parent_id = $1 AND child_id = $2 AND status = 'active'`,
    [session.sub, child_id]
  )
  if (!link) {
    return NextResponse.json({ error: 'هذا الابن غير مربوط بحسابك' }, { status: 403 })
  }

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM parent_content_restrictions
     WHERE parent_child_id = $1 AND restriction_type = $2 AND target_id = $3`,
    [link.id, restriction_type, target_id]
  )

  if (existing) {
    await query(
      `UPDATE parent_content_restrictions SET is_blocked = $2, updated_at = NOW() WHERE id = $1`,
      [existing.id, is_blocked !== false]
    )
    return NextResponse.json({ success: true, message: 'تم تحديث التقييد' })
  }

  await query(
    `INSERT INTO parent_content_restrictions (parent_child_id, restriction_type, target_id, is_blocked)
     VALUES ($1, $2, $3, $4)`,
    [link.id, restriction_type, target_id, is_blocked !== false]
  )

  return NextResponse.json({ success: true, message: 'تم إضافة التقييد بنجاح' })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'parent') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const body = await req.json()
  const { restriction_id, child_id } = body

  if (!restriction_id || !child_id) {
    return NextResponse.json({ error: 'معرف التقييد والابن مطلوبين' }, { status: 400 })
  }

  const link = await queryOne<{ id: string }>(
    `SELECT id FROM parent_children WHERE parent_id = $1 AND child_id = $2 AND status = 'active'`,
    [session.sub, child_id]
  )
  if (!link) {
    return NextResponse.json({ error: 'هذا الابن غير مربوط بحسابك' }, { status: 403 })
  }

  const deleted = await query(
    `DELETE FROM parent_content_restrictions WHERE id = $1 AND parent_child_id = $2 RETURNING id`,
    [restriction_id, link.id]
  )

  if (deleted.length === 0) {
    return NextResponse.json({ error: 'التقييد غير موجود' }, { status: 404 })
  }

  return NextResponse.json({ success: true, message: 'تم حذف التقييد بنجاح' })
}
