import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { declareWinner } from '@/lib/academy/competitions'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || !['academy_admin', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const body = await req.json()

    // Handle winner declaration
    if (body.winner_id) {
      const result = await declareWinner(id, body.winner_id)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true })
    }

    const result = await query(`
      UPDATE competitions SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        max_participants = COALESCE($6, max_participants),
        prizes_description = COALESCE($7, prizes_description),
        status = COALESCE($8, status),
        rules = COALESCE($9, rules),
        tajweed_rules = COALESCE($10, tajweed_rules),
        is_featured = COALESCE($11, is_featured),
        points_multiplier = COALESCE($12, points_multiplier),
        updated_at = NOW()
      WHERE id = $13 RETURNING *
    `, [
      body.title || null,
      body.description || null,
      body.type || null,
      body.start_date || null,
      body.end_date || null,
      body.max_participants || null,
      body.prizes_description || null,
      body.status || null,
      body.rules || null,
      body.tajweed_rules || null,
      body.is_featured !== undefined ? body.is_featured : null,
      body.points_multiplier || null,
      id,
    ])
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }
    return NextResponse.json({ data: result[0] })
  } catch (error) {
    console.error('Error updating competition:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || !['academy_admin', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    await query(`DELETE FROM competitions WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
