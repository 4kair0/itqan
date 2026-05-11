import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  const session = await getSession()

  try {
    const body = await req.json().catch(() => ({}))
    const email = body.email as string | undefined

    const lessons = await query(`
      SELECT l.course_id, c.teacher_id
      FROM lessons l
      LEFT JOIN courses c ON l.course_id = c.id
      WHERE l.id = $1 AND l.is_public = true
    `, [lessonId])

    if (lessons.length === 0) {
      const publicLessons = await query(`
        SELECT id, teacher_id FROM public_lessons WHERE id = $1 AND is_published = true
      `, [lessonId])

      if (publicLessons.length === 0) {
        return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 })
      }

      const teacherId = publicLessons[0].teacher_id

      if (session) {
        const userRow = await query(`SELECT email FROM users WHERE id = $1`, [session.sub])
        const userEmail = userRow[0]?.email
        if (userEmail) {
          await query(`
            INSERT INTO public_lesson_subscribers (email, teacher_id, is_verified, subscribed_at)
            VALUES ($1, $2, true, NOW())
            ON CONFLICT (email, teacher_id) DO NOTHING
          `, [userEmail, teacherId])
        }
      } else if (email) {
        await query(`
          INSERT INTO public_lesson_subscribers (email, teacher_id, is_verified, subscribed_at)
          VALUES ($1, $2, false, NOW())
          ON CONFLICT (email, teacher_id) DO NOTHING
        `, [email, teacherId])
      } else {
        return NextResponse.json({ error: 'البريد الإلكتروني مطلوب للاشتراك' }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    const courseId = lessons[0].course_id
    const teacherId = lessons[0].teacher_id

    if (session) {
      try {
        await query(`
          INSERT INTO enrollments (student_id, course_id, status, enrolled_at)
          VALUES ($1, $2, 'active', NOW())
        `, [session.sub, courseId])
      } catch (e: any) {
        if (e.code !== '23505') throw e
      }

      const userRow = await query(`SELECT email FROM users WHERE id = $1`, [session.sub])
      const userEmail = userRow[0]?.email
      if (userEmail && teacherId) {
        try {
          await query(`
            INSERT INTO public_lesson_subscribers (email, teacher_id, course_id, is_verified, subscribed_at)
            VALUES ($1, $2, $3, true, NOW())
            ON CONFLICT (email, teacher_id) DO NOTHING
          `, [userEmail, teacherId, courseId])
        } catch (e: any) {
          if (e.code !== '23505') throw e
        }
      }
    } else if (email) {
      if (teacherId) {
        await query(`
          INSERT INTO public_lesson_subscribers (email, teacher_id, course_id, is_verified, subscribed_at)
          VALUES ($1, $2, $3, false, NOW())
          ON CONFLICT (email, teacher_id) DO NOTHING
        `, [email, teacherId, courseId])
      }
    } else {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب للاشتراك' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error subscribing to lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
