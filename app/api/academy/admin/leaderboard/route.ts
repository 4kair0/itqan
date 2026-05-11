import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || !['academy_admin', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rows = await query(`
      SELECT
        up.user_id,
        u.name,
        u.email,
        up.total_points,
        up.level,
        up.streak_days,
        up.longest_streak,
        up.last_activity_date,
        up.total_verses_memorized,
        (SELECT COUNT(*)::int FROM badges b WHERE b.user_id = up.user_id) as badges_count,
        (SELECT COUNT(*)::int FROM tasks t
         WHERE t.assigned_to = up.user_id AND t.status = 'done') as tasks_completed
      FROM user_points up
      JOIN users u ON up.user_id = u.id
      ORDER BY up.total_points DESC
      LIMIT 200
    `)

    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error('Error fetching admin leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
