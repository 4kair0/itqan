import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Return all sessions for courses the student is enrolled in.
        // The effective meeting link prefers a per-student override (session_meeting_invites)
        // over the session-level default (course_sessions.meeting_link).
        const rows = await query<{
            id: string
            title: string
            description: string | null
            course_id: string
            course_title: string | null
            teacher_id: string | null
            teacher_name: string | null
            scheduled_at: string
            duration_minutes: number | null
            status: string
            recording_url: string | null
            session_meeting_link: string | null
            session_meeting_provider: string | null
            session_meeting_password: string | null
            invite_meeting_link: string | null
            invite_meeting_provider: string | null
            invite_meeting_password: string | null
            attendees_count: number | null
        }>(
            `
            SELECT
              cs.id,
              cs.title,
              cs.description,
              cs.course_id,
              c.title           AS course_title,
              c.teacher_id,
              t.name            AS teacher_name,
              cs.scheduled_at,
              cs.duration_minutes,
              cs.status,
              cs.recording_url,
              cs.meeting_link    AS session_meeting_link,
              cs.meeting_provider AS session_meeting_provider,
              cs.meeting_password AS session_meeting_password,
              smi.meeting_link    AS invite_meeting_link,
              smi.meeting_provider AS invite_meeting_provider,
              smi.meeting_password AS invite_meeting_password,
              (SELECT COUNT(*)::int FROM session_attendance sa WHERE sa.session_id = cs.id) AS attendees_count
            FROM course_sessions cs
            JOIN courses c ON c.id = cs.course_id
            JOIN enrollments e ON e.course_id = cs.course_id AND e.student_id = $1
            LEFT JOIN users t ON t.id = c.teacher_id
            LEFT JOIN session_meeting_invites smi
              ON smi.session_id = cs.id AND smi.student_id = $1
            WHERE e.status = 'active'
            ORDER BY cs.scheduled_at DESC
            `,
            [session.sub]
        )

        const data = rows.map(r => {
            const effectiveLink = r.invite_meeting_link || r.session_meeting_link
            const effectiveProvider = r.invite_meeting_provider || r.session_meeting_provider
            const effectivePassword = r.invite_meeting_password || r.session_meeting_password
            return {
                id: r.id,
                title: r.title,
                description: r.description ?? undefined,
                course_id: r.course_id,
                course_title: r.course_title ?? '',
                teacher_id: r.teacher_id ?? '',
                teacher_name: r.teacher_name ?? '',
                scheduled_at: r.scheduled_at,
                duration_minutes: r.duration_minutes ?? 60,
                meeting_link: effectiveLink ?? undefined,
                meeting_provider: effectiveProvider ?? undefined,
                meeting_password: effectivePassword ?? undefined,
                status: r.status,
                recording_url: r.recording_url ?? undefined,
                attendees_count: r.attendees_count ?? 0,
                is_personal_link: !!r.invite_meeting_link,
            }
        })

        return NextResponse.json({ data })
    } catch (error) {
        console.error('[API] Error fetching student sessions:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
