import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { sendEmail } from '@/lib/email'

export async function GET() {
  try {
    const weekEnd = new Date()
    const weekStart = new Date()
    weekStart.setDate(weekEnd.getDate() - 7)

    const weekStartStr = weekStart.toISOString().split('T')[0]
    const weekEndStr = weekEnd.toISOString().split('T')[0]

    const activeLinks = await query<{
      link_id: string
      parent_id: string
      child_id: string
      parent_name: string
      parent_email: string
      child_name: string
    }>(
      `SELECT pc.id AS link_id, pc.parent_id, pc.child_id,
              p.name AS parent_name, p.email AS parent_email,
              c.name AS child_name
       FROM parent_children pc
       JOIN users p ON p.id = pc.parent_id
       JOIN users c ON c.id = pc.child_id
       WHERE pc.status = 'active'`
    )

    let reportsSent = 0
    let reportsFailed = 0

    for (const link of activeLinks) {
      try {
        const recitations = await queryOne<{ count: number }>(
          `SELECT COUNT(*)::int AS count FROM recitations
           WHERE student_id = $1 AND created_at >= $2 AND created_at <= $3`,
          [link.child_id, weekStart, weekEnd]
        )

        const sessions = await queryOne<{ count: number }>(
          `SELECT COUNT(*)::int AS count FROM session_attendance
           WHERE student_id = $1 AND joined_at >= $2 AND joined_at <= $3 AND is_present = true`,
          [link.child_id, weekStart, weekEnd]
        )

        const badges = await query<{ badge_name: string }>(
          `SELECT badge_name FROM badges
           WHERE user_id = $1 AND earned_at >= $2 AND earned_at <= $3`,
          [link.child_id, weekStart, weekEnd]
        )

        const points = await queryOne<{ total_points: number; level: string }>(
          `SELECT total_points, level FROM user_points WHERE user_id = $1`,
          [link.child_id]
        )

        const recCount = recitations?.count || 0
        const sessCount = sessions?.count || 0
        const badgeNames = badges.map(b => b.badge_name)
        const currentLevel = points?.level || 'مبتدئ'
        const totalPoints = points?.total_points || 0

        const summary = {
          recitations: recCount,
          sessions_attended: sessCount,
          badges_earned: badgeNames,
          current_level: currentLevel,
          total_points: totalPoints,
        }

        const html = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0B3D2E; font-size: 24px; margin-bottom: 4px;">إتقان التعليمية</h1>
              <p style="color: #64748b; font-size: 13px;">التقرير الأسبوعي</p>
            </div>

            <h2 style="color: #0B3D2E; font-size: 18px;">أهلاً ${link.parent_name} 👋</h2>
            <p style="color: #475569; line-height: 1.7;">
              إليك ملخص أداء <strong>${link.child_name}</strong> لهذا الأسبوع
              (${weekStartStr} - ${weekEndStr}):
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 4px; font-weight: bold;">📖 التلاوات:</td>
                  <td style="padding: 8px 4px;">${recCount} تلاوة</td>
                </tr>
                <tr>
                  <td style="padding: 8px 4px; font-weight: bold;">🎓 الجلسات المحضورة:</td>
                  <td style="padding: 8px 4px;">${sessCount} جلسة</td>
                </tr>
                <tr>
                  <td style="padding: 8px 4px; font-weight: bold;">📊 المستوى الحالي:</td>
                  <td style="padding: 8px 4px;">${currentLevel}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 4px; font-weight: bold;">⭐ مجموع النقاط:</td>
                  <td style="padding: 8px 4px;">${totalPoints} نقطة</td>
                </tr>
                ${badgeNames.length > 0 ? `
                <tr>
                  <td style="padding: 8px 4px; font-weight: bold;">🏅 شارات جديدة:</td>
                  <td style="padding: 8px 4px;">${badgeNames.join('، ')}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${recCount === 0 && sessCount === 0 ? `
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 10px; padding: 12px; margin: 16px 0; text-align: center;">
              <p style="color: #92400e; margin: 0;">⚠️ لم يتم تسجيل أي نشاط هذا الأسبوع. شجّع ابنك على المتابعة!</p>
            </div>
            ` : ''}

            <div style="margin: 24px 0; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://itqan.academy'}/academy/parent/progress"
                 style="display: inline-block; background-color: #0B3D2E; color: white; text-decoration: none;
                        padding: 14px 36px; border-radius: 10px; font-weight: bold; font-size: 16px;">
                📊 عرض التقدم الكامل
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              منصة إتقان التعليمية — التقرير الأسبوعي التلقائي
            </p>
          </div>
        `

        let emailSent = false
        let emailError: string | null = null
        try {
          emailSent = await sendEmail({
            to: link.parent_email,
            subject: `📊 التقرير الأسبوعي لـ ${link.child_name} — إتقان التعليمية`,
            body: `التقرير الأسبوعي لـ ${link.child_name}: ${recCount} تلاوة، ${sessCount} جلسة، المستوى: ${currentLevel}`,
            html,
          })
        } catch (e: any) {
          emailError = e.message || 'Unknown error'
        }

        await query(
          `INSERT INTO parent_weekly_reports
            (parent_id, child_id, parent_child_id, week_start, week_end,
             recitations_count, sessions_attended, badges_earned,
             current_level, summary, email_sent, email_error, sent_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
          [
            link.parent_id, link.child_id, link.link_id,
            weekStartStr, weekEndStr,
            recCount, sessCount, badgeNames.length,
            currentLevel, JSON.stringify(summary),
            emailSent, emailError,
          ]
        )

        if (emailSent) reportsSent++
        else reportsFailed++
      } catch (e: any) {
        console.error(`[weekly-report] Error for link ${link.link_id}:`, e)
        reportsFailed++
      }
    }

    return NextResponse.json({
      success: true,
      total_links: activeLinks.length,
      reports_sent: reportsSent,
      reports_failed: reportsFailed,
      week: `${weekStartStr} - ${weekEndStr}`,
    })
  } catch (error) {
    console.error('[weekly-report] Fatal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
