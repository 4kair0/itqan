import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rows = await query(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.course_id,
        c.title as course_title,
        COALESCE(t.task_type, 'written') as type,
        t.due_date,
        COALESCE(t.max_score, t.points_reward, 0) as points_value,
        t.status,
        ts.id as submission_id,
        ts.status as submission_status,
        ts.grade,
        ts.feedback
      FROM tasks t
      LEFT JOIN courses c ON t.course_id = c.id
      LEFT JOIN task_submissions ts ON ts.task_id = t.id AND ts.student_id = $1
      WHERE t.assigned_to = $1
         OR EXISTS (
           SELECT 1 FROM enrollments e
           WHERE e.course_id = t.course_id AND e.student_id = $1 AND e.status = 'active'
         )
      ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
    `, [session.sub])

    const data = rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? undefined,
      course_id: r.course_id,
      course_title: r.course_title ?? '',
      type: r.type ?? 'written',
      due_date: r.due_date ?? undefined,
      points_value: r.points_value ?? 0,
      status: r.submission_status === 'graded' ? 'graded'
        : r.submission_status === 'submitted' ? 'submitted'
        : (r.due_date && new Date(r.due_date as string) < new Date()) ? 'late'
        : 'pending',
      grade: r.grade ?? undefined,
      feedback: r.feedback ?? undefined,
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[API] Error fetching student tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
