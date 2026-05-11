import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import { getActiveParentChild } from '@/lib/parent-helpers'

// GET overview stats for a linked child
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

  // Basic child info
  const child = await queryOne<{
    id: string
    name: string
    email: string
    avatar_url: string | null
    created_at: string
  }>(
    `SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1`,
    [childId]
  )

  // Recitations summary
  const recitationsStats = await queryOne<{
    total: number
    mastered: number
    pending: number
    last_at: string | null
  }>(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'mastered')::int AS mastered,
       COUNT(*) FILTER (WHERE status IN ('pending','in_review'))::int AS pending,
       MAX(created_at) AS last_at
     FROM recitations WHERE student_id = $1`,
    [childId]
  )

  // Sessions summary (bookings)
  const sessionsStats = await queryOne<{
    total: number
    attended: number
    upcoming: number
    last_at: string | null
  }>(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status IN ('completed') OR student_joined_at IS NOT NULL)::int AS attended,
       COUNT(*) FILTER (WHERE status = 'confirmed' AND scheduled_at > NOW())::int AS upcoming,
       MAX(scheduled_at) AS last_at
     FROM bookings WHERE student_id = $1`,
    [childId]
  )

  // Badges count
  const badgesStats = await queryOne<{ total: number; recent_at: string | null }>(
    `SELECT COUNT(*)::int AS total, MAX(awarded_at) AS recent_at FROM badges WHERE user_id = $1`,
    [childId]
  )

  // Memorization & tajweed path level (current, from learning_paths)
  const memPath = await queryOne<{
    title: string
    progress_percentage: number
    total_courses: number
  }>(
    `SELECT lp.title, spp.progress_percentage::float AS progress_percentage, lp.total_courses
     FROM student_path_progress spp
     JOIN learning_paths lp ON lp.id = spp.path_id
     WHERE spp.student_id = $1 AND lp.subject = 'quran' AND spp.completed_at IS NULL
     ORDER BY spp.updated_at DESC NULLS LAST
     LIMIT 1`,
    [childId]
  )

  const tajPath = await queryOne<{
    title: string
    progress_percentage: number
    total_courses: number
  }>(
    `SELECT lp.title, spp.progress_percentage::float AS progress_percentage, lp.total_courses
     FROM student_path_progress spp
     JOIN learning_paths lp ON lp.id = spp.path_id
     WHERE spp.student_id = $1 AND lp.subject = 'tajweed' AND spp.completed_at IS NULL
     ORDER BY spp.updated_at DESC NULLS LAST
     LIMIT 1`,
    [childId]
  )

  // Active enrollments count
  const enrollmentsStats = await queryOne<{ active_count: number }>(
    `SELECT COUNT(*)::int AS active_count FROM enrollments
     WHERE student_id = $1 AND status = 'active'`,
    [childId]
  )

  return NextResponse.json({
    child: child
      ? {
          id: child.id,
          name: child.name,
          email: child.email,
          avatar_url: child.avatar_url,
          joined_at: child.created_at,
        }
      : null,
    link: {
      id: link.id,
      relation: link.relation,
      confirmed_at: link.confirmed_at,
    },
    recitations: recitationsStats || { total: 0, mastered: 0, pending: 0, last_at: null },
    sessions: sessionsStats || { total: 0, attended: 0, upcoming: 0, last_at: null },
    badges: badgesStats || { total: 0, recent_at: null },
    paths: {
      memorization: memPath,
      tajweed: tajPath,
    },
    enrollments: enrollmentsStats || { active_count: 0 },
  })
}
