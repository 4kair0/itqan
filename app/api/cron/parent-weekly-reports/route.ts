import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendWeeklyReport, lastFullWeekRange } from '@/lib/parent-weekly-report'

// Cron-callable endpoint. Recommended schedule: Mondays 07:00 in Asia/Riyadh.
// Iterates over every active parent-child link and sends one email each.
export async function GET() {
  try {
    const range = lastFullWeekRange()
    const links = await query<{
      id: string
      parent_id: string
      child_id: string
    }>(
      `SELECT id, parent_id, child_id FROM parent_children WHERE status = 'active'`
    )

    let sent = 0
    let failed = 0
    const errors: Array<{ parent_id: string; child_id: string; error: string }> = []

    for (const link of links) {
      try {
        const r = await sendWeeklyReport({
          parentId: link.parent_id,
          childId: link.child_id,
          parentChildId: link.id,
          range,
        })
        if (r.ok) sent++
        else {
          failed++
          if (r.error) errors.push({ parent_id: link.parent_id, child_id: link.child_id, error: r.error })
        }
      } catch (err: unknown) {
        failed++
        errors.push({
          parent_id: link.parent_id,
          child_id: link.child_id,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: links.length,
      sent,
      failed,
      errors: errors.slice(0, 20),
      week_start: range.start.toISOString().split('T')[0],
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
