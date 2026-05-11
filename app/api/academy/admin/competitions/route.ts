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
      SELECT c.*,
        (SELECT COUNT(*)::int FROM competition_entries ce WHERE ce.competition_id = c.id) as participants_count
      FROM competitions c
      ORDER BY c.created_at DESC
    `)
    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error('Error fetching competitions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !['academy_admin', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { title, description, type, start_date, end_date, max_participants, prizes_description, rules, tajweed_rules, is_featured, points_multiplier } = body
    if (!title || !start_date || !end_date) {
      return NextResponse.json({ error: 'Title, start_date and end_date required' }, { status: 400 })
    }
    const now = new Date()
    const start = new Date(start_date)
    const status = start > now ? 'upcoming' : 'active'
    
    const result = await query(`
      INSERT INTO competitions (title, description, type, start_date, end_date, max_participants, prizes_description, rules, tajweed_rules, is_featured, points_multiplier, status, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *
    `, [
      title,
      description || null,
      type || 'monthly',
      start_date,
      end_date,
      max_participants || 100,
      prizes_description || null,
      rules || null,
      tajweed_rules && tajweed_rules.length > 0 ? tajweed_rules : null,
      is_featured || false,
      points_multiplier || 1,
      status,
      session.sub,
    ])
    
    return NextResponse.json({ data: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating competition:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
