import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { getActiveParentChild } from '@/lib/parent-helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'parent') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id: childId } = await params
  const link = await getActiveParentChild(session.sub, childId)
  if (!link) {
    return NextResponse.json({ error: 'الطالب غير مربوط بحسابك' }, { status: 403 })
  }

  const rows = await query<{
    id: string
    badge_key: string
    badge_name: string
    badge_description: string | null
    badge_icon: string
    badge_image_url: string | null
    badge_color: string
    points_awarded: number
    awarded_at: string
  }>(
    `SELECT b.id, b.badge_key, b.badge_name, b.badge_description,
            COALESCE(bd.badge_icon, '🏆') as badge_icon,
            bd.badge_image_url,
            COALESCE(bd.badge_color, '#F59E0B') as badge_color,
            COALESCE(b.points_awarded, 0) as points_awarded,
            b.awarded_at
     FROM badges b
     LEFT JOIN badge_definitions bd ON bd.badge_key = b.badge_key
     WHERE b.user_id = $1
     ORDER BY b.awarded_at DESC`,
    [childId]
  )

  return NextResponse.json({ badges: rows })
}
