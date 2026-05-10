import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { generatePublicSlug } from '@/lib/public-lessons'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session || !['teacher', 'academy_admin', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const isAdmin = ['academy_admin', 'admin'].includes(session.role)
  const params: unknown[] = []
  let where = ''
  if (!isAdmin) { where = 'WHERE teacher_id = $1'; params.push(session.sub) }
  const rows = await query(
    `SELECT id, teacher_id, title, description, cover_image_url, public_slug,
            meeting_link, meeting_provider, meeting_password,
            scheduled_at, duration_minutes, status, is_published,
            view_count, signup_count, created_at, updated_at
       FROM public_lessons ${where}
       ORDER BY scheduled_at DESC`,
    params
  )
  return NextResponse.json({ data: rows })
}

interface CreateBody {
  title: string
  description?: string
  scheduled_at: string
  duration_minutes?: number
  cover_image_url?: string | null
  meeting_link?: string | null
  meeting_provider?: 'zoom' | 'google_meet' | 'other' | null
  meeting_password?: string | null
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !['teacher', 'academy_admin', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: CreateBody
  try {
    body = (await req.json()) as CreateBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.title?.trim() || !body.scheduled_at) {
    return NextResponse.json({ error: 'العنوان والموعد مطلوبان' }, { status: 400 })
  }

  // Generate a unique slug (retry on extremely unlikely collision)
  let slug = generatePublicSlug()
  for (let attempt = 0; attempt < 5; attempt++) {
    const exists = await query<{ id: string }>(`SELECT id FROM public_lessons WHERE public_slug = $1 LIMIT 1`, [slug])
    if (exists.length === 0) break
    slug = generatePublicSlug()
  }

  const provider = body.meeting_provider && ['zoom', 'google_meet', 'other'].includes(body.meeting_provider)
    ? body.meeting_provider : null

  const result = await query(
    `INSERT INTO public_lessons
       (teacher_id, title, description, cover_image_url, public_slug,
        meeting_link, meeting_provider, meeting_password,
        scheduled_at, duration_minutes, status, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'scheduled', true)
     RETURNING *`,
    [
      session.sub,
      body.title.trim().slice(0, 255),
      body.description?.trim() || null,
      body.cover_image_url || null,
      slug,
      body.meeting_link?.trim() || null,
      provider,
      body.meeting_password?.trim() || null,
      body.scheduled_at,
      body.duration_minutes || 60,
    ]
  )

  return NextResponse.json({ data: result[0] }, { status: 201 })
}
