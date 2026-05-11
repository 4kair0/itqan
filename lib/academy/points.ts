import { query, queryOne } from '@/lib/db'
import { PointsAction } from '@/lib/types'
import { checkAndAwardBadges as checkBadgesFromDefinitions } from '@/lib/academy/badges'

// ── Point Values (as per requirements) ──────────────────────────
export const POINTS = {
  recitation: 10,        // تسجيل تلاوة
  mastered: 30,          // إتقان تلاوة
  task: 15,              // إنهاء مهمة
  session_attend: 20,    // حضور درس
  streak: 5,             // يوم Streak
  juz_complete: 100,     // إنهاء جزء كامل
  course_complete: 50,
  lesson: 10,
  daily_login: 2,
  competition_win: 200,
  badge_earned: 25,
} as const

// ── Level Thresholds ────────────────────────────────────────────
export const LEVELS = [
  { key: 'beginner',     min: 0,    label: 'مبتدئ' },
  { key: 'intermediate', min: 500,  label: 'متوسط' },
  { key: 'advanced',     min: 2000, label: 'متقدم' },
  { key: 'hafiz',        min: 5000, label: 'حافظ' },
] as const

export type LevelKey = typeof LEVELS[number]['key']

export function levelForPoints(totalPoints: number): LevelKey {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVELS[i].min) return LEVELS[i].key
  }
  return 'beginner'
}

// ── Streak Multiplier ───────────────────────────────────────────
const STREAK_MULTIPLIER_THRESHOLD = 7
const STREAK_MULTIPLIER = 1.5

export async function getStreakMultiplier(userId: string): Promise<number> {
  const row = await queryOne<{ streak_days: number }>(
    `SELECT streak_days FROM user_points WHERE user_id = $1`,
    [userId],
  )
  return (row?.streak_days ?? 0) >= STREAK_MULTIPLIER_THRESHOLD ? STREAK_MULTIPLIER : 1
}

// ── Core: Award Points ──────────────────────────────────────────
export async function awardPoints(
  userId: string,
  basePoints: number,
  reason: PointsAction,
  description?: string,
  relatedEntityType?: string,
  relatedEntityId?: string,
): Promise<{ awarded: number; newTotal: number; level: LevelKey }> {
  // Apply streak multiplier for non-streak actions
  const multiplier = reason !== 'streak' ? await getStreakMultiplier(userId) : 1
  const awarded = Math.round(basePoints * multiplier)

  // Upsert user_points
  const row = await queryOne<{ total_points: number }>(
    `INSERT INTO user_points (user_id, total_points, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE
       SET total_points = user_points.total_points + $2,
           updated_at = NOW()
     RETURNING total_points`,
    [userId, awarded],
  )

  const newTotal = row?.total_points ?? awarded
  const level = levelForPoints(newTotal)

  // Update level
  await query(
    `UPDATE user_points SET level = $1 WHERE user_id = $2 AND level IS DISTINCT FROM $1`,
    [level, userId],
  )

  // Log the transaction
  await query(
    `INSERT INTO points_log (user_id, points, reason, description, related_entity_type, related_entity_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, awarded, reason, description || null, relatedEntityType || null, relatedEntityId || null],
  )

  // Check & award badges
  await checkAndAwardBadges(userId, newTotal)

  return { awarded, newTotal, level }
}

// ── Streak Management ───────────────────────────────────────────
export async function updateStreak(userId: string): Promise<{ streak: number; bonusAwarded: boolean }> {
  const row = await queryOne<{
    streak_days: number
    longest_streak: number
    last_activity_date: string | null
  }>(
    `SELECT streak_days, longest_streak, last_activity_date FROM user_points WHERE user_id = $1`,
    [userId],
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  if (!row) {
    await query(
      `INSERT INTO user_points (user_id, streak_days, longest_streak, last_activity_date, updated_at)
       VALUES ($1, 1, 1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET streak_days = 1, longest_streak = GREATEST(user_points.longest_streak, 1),
             last_activity_date = $2, updated_at = NOW()`,
      [userId, todayStr],
    )
    await awardPoints(userId, POINTS.streak, 'streak', 'مكافأة يوم Streak')
    return { streak: 1, bonusAwarded: true }
  }

  const lastDate = row.last_activity_date ? new Date(row.last_activity_date) : null
  if (lastDate) lastDate.setHours(0, 0, 0, 0)

  if (lastDate && lastDate.getTime() === today.getTime()) {
    return { streak: row.streak_days, bonusAwarded: false }
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let newStreak: number
  if (lastDate && lastDate.getTime() === yesterday.getTime()) {
    newStreak = row.streak_days + 1
  } else {
    newStreak = 1
  }

  const newLongest = Math.max(newStreak, row.longest_streak)

  await query(
    `UPDATE user_points
     SET streak_days = $1, longest_streak = $2, last_activity_date = $3, updated_at = NOW()
     WHERE user_id = $4`,
    [newStreak, newLongest, todayStr, userId],
  )

  await awardPoints(userId, POINTS.streak, 'streak', `مكافأة يوم Streak (${newStreak} يوم)`)
  return { streak: newStreak, bonusAwarded: true }
}

// ── Convenience Wrappers ────────────────────────────────────────

export async function awardRecitationPoints(userId: string, recitationId: string) {
  await updateStreak(userId)
  return awardPoints(userId, POINTS.recitation, 'recitation', 'تسجيل تلاوة', 'recitation', recitationId)
}

export async function awardMasteryPoints(userId: string, recitationId: string) {
  return awardPoints(userId, POINTS.mastered, 'mastered', 'إتقان تلاوة', 'recitation', recitationId)
}

export async function awardTaskPoints(userId: string, taskId: string) {
  await updateStreak(userId)
  return awardPoints(userId, POINTS.task, 'task', 'إنهاء مهمة', 'task', taskId)
}

export async function awardAttendancePoints(userId: string, sessionId: string) {
  await updateStreak(userId)
  return awardPoints(userId, POINTS.session_attend, 'session_attend', 'حضور درس', 'session', sessionId)
}

export async function awardJuzCompletePoints(userId: string, juzNumber: number) {
  return awardPoints(userId, POINTS.juz_complete, 'juz_complete', `إنهاء الجزء ${juzNumber}`)
}

export async function awardCourseCompletePoints(userId: string, courseId: string) {
  return awardPoints(userId, POINTS.course_complete, 'course_complete', 'إنهاء دورة', 'course', courseId)
}

// ── Badge System ────────────────────────────────────────────────
async function checkAndAwardBadges(userId: string, _totalPoints: number): Promise<void> {
  try {
    await checkBadgesFromDefinitions(userId)
  } catch (error) {
    console.error('Error checking badges:', error)
  }
}

// ── Admin: Manual Adjust ────────────────────────────────────────
export async function adminAdjustPoints(
  userId: string,
  points: number,
  description: string,
  adminId: string,
): Promise<{ newTotal: number; level: LevelKey }> {
  const row = await queryOne<{ total_points: number }>(
    `INSERT INTO user_points (user_id, total_points, updated_at)
     VALUES ($1, GREATEST($2, 0), NOW())
     ON CONFLICT (user_id) DO UPDATE
       SET total_points = GREATEST(user_points.total_points + $2, 0),
           updated_at = NOW()
     RETURNING total_points`,
    [userId, points],
  )

  const newTotal = row?.total_points ?? 0
  const level = levelForPoints(newTotal)

  await query(`UPDATE user_points SET level = $1 WHERE user_id = $2`, [level, userId])

  await query(
    `INSERT INTO points_log (user_id, points, reason, description, related_entity_type, related_entity_id)
     VALUES ($1, $2, 'admin_adjust', $3, 'admin', $4)`,
    [userId, points, description, adminId],
  )

  return { newTotal, level }
}
