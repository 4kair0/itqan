import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()

  if (!session || !['teacher', 'academy_admin', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rows = await query(
      `
      SELECT
        cs.id,
        cs.course_id,
        cs.title,
        cs.description,
        cs.session_type,
        cs.scheduled_at,
        cs.duration_minutes,
        cs.status,
        cs.meeting_link,
        cs.meeting_provider,
        cs.meeting_password,
        cs.recording_url,
        cs.created_at,
        c.title AS course_title,
        (SELECT COUNT(*)::int FROM enrollments e WHERE e.course_id = cs.course_id AND e.status = 'active') AS enrolled_count,
        (SELECT COUNT(*)::int FROM session_attendance sa WHERE sa.session_id = cs.id) AS attendance_count,
        (SELECT COUNT(*)::int FROM session_meeting_invites smi WHERE smi.session_id = cs.id) AS personal_invites_count
      FROM course_sessions cs
      LEFT JOIN courses c ON cs.course_id = c.id
      WHERE cs.teacher_id = $1
      ORDER BY cs.scheduled_at DESC
      `,
      [session.sub]
    )

    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()

  if (!session || !['teacher', 'academy_admin', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { course_id, title, description, scheduled_at, duration_minutes } = body

    if (!course_id || !title || !scheduled_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify teacher owns this course (admins can create on any course)
    if (session.role === 'teacher') {
      const courseCheck = await query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [course_id, session.sub])
      if (courseCheck.length === 0) {
        return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 403 })
      }
    }

    const result = await query(
      `
      INSERT INTO course_sessions
        (course_id, teacher_id, title, description, scheduled_at, duration_minutes, session_type, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'live', 'scheduled', NOW())
      RETURNING *
      `,
      [course_id, session.sub, title, description || null, scheduled_at, duration_minutes || 60]
    )

    return NextResponse.json({ data: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
