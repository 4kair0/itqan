import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import { awardRecitationPoints, awardJuzCompletePoints, updateStreak } from '@/lib/academy/points'

export async function GET(req: NextRequest) {
  const session = await getSession()
  
  if (!session || !['student', 'teacher', 'parent', 'academy_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rows = await query(`
      SELECT 
        ml.*
      FROM memorization_log ml
      WHERE ml.student_id = $1
      ORDER BY ml.log_date DESC, ml.created_at DESC
      LIMIT 50
    `, [session.sub])

    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error('Error fetching memorization log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  
  if (!session || !['student'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { surah_number, surah_name, juz_number, new_verses, revised_verses, quality_rating, notes } = body

    if (!new_verses && !revised_verses) {
      return NextResponse.json({ error: 'يجب إدخال عدد الآيات المحفوظة أو المراجعة' }, { status: 400 })
    }

    const result = await query(`
      INSERT INTO memorization_log (student_id, log_date, surah_number, surah_name, juz_number, new_verses, revised_verses, quality_rating, notes)
      VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (student_id, log_date) DO UPDATE SET
        surah_number = COALESCE(EXCLUDED.surah_number, memorization_log.surah_number),
        surah_name = COALESCE(EXCLUDED.surah_name, memorization_log.surah_name),
        juz_number = COALESCE(EXCLUDED.juz_number, memorization_log.juz_number),
        new_verses = memorization_log.new_verses + COALESCE(EXCLUDED.new_verses, 0),
        revised_verses = memorization_log.revised_verses + COALESCE(EXCLUDED.revised_verses, 0),
        quality_rating = COALESCE(EXCLUDED.quality_rating, memorization_log.quality_rating),
        notes = COALESCE(EXCLUDED.notes, memorization_log.notes),
        updated_at = NOW()
      RETURNING *
    `, [session.sub, surah_number || null, surah_name || null, juz_number || null, 
        new_verses || 0, revised_verses || 0, quality_rating || null, notes || null])

    // Award points and update streak
    try {
      await updateStreak(session.sub)

      // Update total verses in user_points
      await query(
        `UPDATE user_points
         SET total_verses_memorized = total_verses_memorized + $1,
             total_verses_revised = total_verses_revised + $2
         WHERE user_id = $3`,
        [new_verses || 0, revised_verses || 0, session.sub],
      )

      // Check if a full juz was completed (approximately 20 pages / ~600 verses per juz)
      if (juz_number) {
        const totalInJuz = await queryOne<{ total: number }>(
          `SELECT COALESCE(SUM(new_verses), 0)::int as total
           FROM memorization_log
           WHERE student_id = $1 AND juz_number = $2`,
          [session.sub, juz_number],
        )
        // Average juz has ~200 verses; award when reaching that threshold
        if (totalInJuz && totalInJuz.total >= 200) {
          const alreadyAwarded = await query(
            `SELECT id FROM points_log
             WHERE user_id = $1 AND reason = 'juz_complete' AND description LIKE $2
             LIMIT 1`,
            [session.sub, `%الجزء ${juz_number}%`],
          )
          if (alreadyAwarded.length === 0) {
            await awardJuzCompletePoints(session.sub, juz_number)
          }
        }
      }
    } catch (e) {
      console.error('Failed to award memorization points:', e)
    }

    return NextResponse.json({ data: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating memorization log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
