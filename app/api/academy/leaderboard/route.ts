import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getLeaderboard } from '@/lib/academy/competitions'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const period = (searchParams.get('period') || 'all_time') as 'weekly' | 'monthly' | 'all_time'
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
  const halqaId = searchParams.get('halqa_id') || undefined

  try {
    const result = await getLeaderboard({
      period,
      halqaId,
      limit,
      currentUserId: session.sub,
    })

    return NextResponse.json({ data: result.data, current_user: result.currentUser })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
