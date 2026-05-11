import { query, queryOne } from '@/lib/db'
import { awardBadge } from '@/lib/academy/badges'
import { awardPoints, POINTS } from '@/lib/academy/points'

// ── Types ──

export interface Competition {
  id: string
  title: string
  description: string | null
  type: 'monthly' | 'ramadan' | 'tajweed' | 'memorization' | 'weekly' | 'special'
  start_date: string
  end_date: string
  status: 'upcoming' | 'active' | 'ended' | 'cancelled'
  max_participants: number | null
  prizes_description: string | null
  rules: string | null
  tajweed_rules: string[] | null
  badge_key: string | null
  points_multiplier: number
  is_featured: boolean
  halqa_id: string | null
  min_verses: number
  created_by: string
  winner_id: string | null
  created_at: string
  participants_count?: number
  has_joined?: boolean
}

export interface CompetitionEntry {
  id: string
  competition_id: string
  student_id: string
  student_name?: string
  student_email?: string
  recitation_id: string | null
  score: number | null
  rank: number | null
  submission_url: string | null
  notes: string | null
  submitted_at: string
  evaluated_at: string | null
  evaluated_by: string | null
  evaluator_name?: string
  status: 'pending' | 'evaluated' | 'winner' | 'disqualified'
  tajweed_scores: Record<string, number>
  feedback: string | null
  verses_count: number
  halqa_id: string | null
  competition_title?: string
  competition_type?: string
}

// ── Tajweed Rules ──

export const TAJWEED_RULES = [
  { key: 'idgham', label: 'الإدغام', maxScore: 10 },
  { key: 'ikhfa', label: 'الإخفاء', maxScore: 10 },
  { key: 'iqlab', label: 'الإقلاب', maxScore: 10 },
  { key: 'izhar', label: 'الإظهار', maxScore: 10 },
  { key: 'madd', label: 'المدود', maxScore: 10 },
  { key: 'qalqala', label: 'القلقلة', maxScore: 10 },
  { key: 'ghunna', label: 'الغنة', maxScore: 10 },
  { key: 'tafkhim_tarqiq', label: 'التفخيم والترقيق', maxScore: 10 },
  { key: 'waqf', label: 'الوقف والابتداء', maxScore: 10 },
  { key: 'makharij', label: 'مخارج الحروف', maxScore: 10 },
] as const

// ── Get active/upcoming competitions ──

export async function getCompetitions(filters?: {
  status?: string
  type?: string
  userId?: string
  halqaId?: string
}): Promise<Competition[]> {
  let conditions = 'WHERE 1=1'
  const params: unknown[] = []
  let paramIdx = 1

  if (filters?.status) {
    conditions += ` AND c.status = $${paramIdx++}`
    params.push(filters.status)
  }
  if (filters?.type) {
    conditions += ` AND c.type = $${paramIdx++}`
    params.push(filters.type)
  }
  if (filters?.halqaId) {
    conditions += ` AND (c.halqa_id = $${paramIdx++} OR c.halqa_id IS NULL)`
    params.push(filters.halqaId)
  }

  let userJoinSelect = ''
  let userJoin = ''
  if (filters?.userId) {
    userJoinSelect = `, CASE WHEN ej.id IS NOT NULL THEN true ELSE false END as has_joined`
    userJoin = `LEFT JOIN competition_entries ej ON ej.competition_id = c.id AND ej.student_id = $${paramIdx++}`
    params.push(filters.userId)
  }

  const rows = await query<Competition>(
    `SELECT c.*,
       (SELECT COUNT(*)::int FROM competition_entries ce WHERE ce.competition_id = c.id) as participants_count
       ${userJoinSelect}
     FROM competitions c
     ${userJoin}
     ${conditions}
     ORDER BY c.is_featured DESC, c.start_date DESC`,
    params,
  )
  return rows
}

// ── Get single competition with details ──

export async function getCompetition(id: string, userId?: string): Promise<Competition | null> {
  let userJoinSelect = ''
  let userJoin = ''
  const params: unknown[] = [id]

  if (userId) {
    userJoinSelect = `, CASE WHEN ej.id IS NOT NULL THEN true ELSE false END as has_joined`
    userJoin = `LEFT JOIN competition_entries ej ON ej.competition_id = c.id AND ej.student_id = $2`
    params.push(userId)
  }

  return queryOne<Competition>(
    `SELECT c.*,
       (SELECT COUNT(*)::int FROM competition_entries ce WHERE ce.competition_id = c.id) as participants_count
       ${userJoinSelect}
     FROM competitions c
     ${userJoin}
     WHERE c.id = $1`,
    params,
  )
}

// ── Join a competition ──

export async function joinCompetition(competitionId: string, studentId: string, halqaId?: string): Promise<{ success: boolean; error?: string }> {
  const comp = await getCompetition(competitionId)
  if (!comp) return { success: false, error: 'المسابقة غير موجودة' }
  if (comp.status !== 'active') return { success: false, error: 'المسابقة غير نشطة حالياً' }

  const existing = await queryOne(
    `SELECT id FROM competition_entries WHERE competition_id = $1 AND student_id = $2`,
    [competitionId, studentId],
  )
  if (existing) return { success: false, error: 'أنت مسجل بالفعل في هذه المسابقة' }

  if (comp.max_participants) {
    const countRow = await queryOne<{ cnt: number }>(
      `SELECT COUNT(*)::int as cnt FROM competition_entries WHERE competition_id = $1`,
      [competitionId],
    )
    if ((countRow?.cnt ?? 0) >= comp.max_participants) {
      return { success: false, error: 'المسابقة مكتملة العدد' }
    }
  }

  await query(
    `INSERT INTO competition_entries (competition_id, student_id, halqa_id, status)
     VALUES ($1, $2, $3, 'pending')`,
    [competitionId, studentId, halqaId || null],
  )

  return { success: true }
}

// ── Submit entry (recitation URL) ──

export async function submitEntry(
  competitionId: string,
  studentId: string,
  data: { submissionUrl?: string; recitationId?: string; notes?: string; versesCount?: number },
): Promise<{ success: boolean; error?: string }> {
  const entry = await queryOne<CompetitionEntry>(
    `SELECT * FROM competition_entries WHERE competition_id = $1 AND student_id = $2`,
    [competitionId, studentId],
  )
  if (!entry) return { success: false, error: 'لم يتم التسجيل في هذه المسابقة' }

  await query(
    `UPDATE competition_entries
     SET submission_url = COALESCE($1, submission_url),
         recitation_id = COALESCE($2, recitation_id),
         notes = COALESCE($3, notes),
         verses_count = COALESCE($4, verses_count),
         submitted_at = NOW()
     WHERE competition_id = $5 AND student_id = $6`,
    [data.submissionUrl || null, data.recitationId || null, data.notes || null, data.versesCount || null, competitionId, studentId],
  )

  return { success: true }
}

// ── Get competition entries (for judges/admin) ──

export async function getEntries(competitionId: string): Promise<CompetitionEntry[]> {
  return query<CompetitionEntry>(
    `SELECT ce.*,
       u.name as student_name,
       u.email as student_email,
       ev.name as evaluator_name
     FROM competition_entries ce
     JOIN users u ON u.id = ce.student_id
     LEFT JOIN users ev ON ev.id = ce.evaluated_by
     WHERE ce.competition_id = $1
     ORDER BY ce.score DESC NULLS LAST, ce.submitted_at ASC`,
    [competitionId],
  )
}

// ── Get student's entries ──

export async function getStudentEntries(studentId: string): Promise<CompetitionEntry[]> {
  return query<CompetitionEntry>(
    `SELECT ce.*,
       c.title as competition_title,
       c.type as competition_type
     FROM competition_entries ce
     JOIN competitions c ON c.id = ce.competition_id
     WHERE ce.student_id = $1
     ORDER BY ce.submitted_at DESC`,
    [studentId],
  )
}

// ── Evaluate entry (judge) ──

export async function evaluateEntry(
  entryId: string,
  judgeId: string,
  data: { score: number; tajweedScores?: Record<string, number>; feedback?: string },
): Promise<{ success: boolean; error?: string }> {
  const entry = await queryOne<CompetitionEntry>(
    `SELECT ce.*, c.type FROM competition_entries ce
     JOIN competitions c ON c.id = ce.competition_id
     WHERE ce.id = $1`,
    [entryId],
  )
  if (!entry) return { success: false, error: 'المشاركة غير موجودة' }

  await query(
    `UPDATE competition_entries
     SET score = $1,
         tajweed_scores = $2,
         feedback = $3,
         evaluated_by = $4,
         evaluated_at = NOW(),
         status = 'evaluated'
     WHERE id = $5`,
    [data.score, JSON.stringify(data.tajweedScores || {}), data.feedback || null, judgeId, entryId],
  )

  return { success: true }
}

// ── Declare winner ──

export async function declareWinner(
  competitionId: string,
  winnerId: string,
): Promise<{ success: boolean; error?: string }> {
  const comp = await getCompetition(competitionId)
  if (!comp) return { success: false, error: 'المسابقة غير موجودة' }

  // Update competition winner
  await query(
    `UPDATE competitions SET winner_id = $1, status = 'ended', updated_at = NOW() WHERE id = $2`,
    [winnerId, competitionId],
  )

  // Mark entry as winner
  await query(
    `UPDATE competition_entries SET status = 'winner', rank = 1 WHERE competition_id = $1 AND student_id = $2`,
    [competitionId, winnerId],
  )

  // Award badge based on competition type
  const badgeMap: Record<string, string> = {
    monthly: 'monthly_star',
    tajweed: 'tajweed_champion',
    ramadan: 'ramadan_champion',
  }
  const badgeKey = comp.badge_key || badgeMap[comp.type] || 'competition_winner'
  await awardBadge(winnerId, badgeKey)

  // Award doubled points
  const multiplier = comp.points_multiplier || 2
  await awardPoints(
    winnerId,
    Math.round(POINTS.competition_win * multiplier),
    'competition_win',
    `فوز بمسابقة: ${comp.title}`,
    'competition',
    competitionId,
  )

  return { success: true }
}

// ── Get entries pending judgment for a judge ──

export async function getJudgeAssignments(judgeId: string): Promise<Competition[]> {
  return query<Competition>(
    `SELECT DISTINCT c.*,
       (SELECT COUNT(*)::int FROM competition_entries ce WHERE ce.competition_id = c.id) as participants_count,
       (SELECT COUNT(*)::int FROM competition_entries ce WHERE ce.competition_id = c.id AND ce.status = 'pending' AND ce.submission_url IS NOT NULL) as pending_count
     FROM competitions c
     JOIN competition_judges cj ON cj.competition_id = c.id
     WHERE cj.judge_id = $1 AND c.status IN ('active', 'ended')
     ORDER BY c.start_date DESC`,
    [judgeId],
  )
}

// ── Leaderboard with halqa filter ──

export async function getLeaderboard(options: {
  period?: 'weekly' | 'monthly' | 'all_time'
  halqaId?: string
  limit?: number
  currentUserId?: string
}): Promise<{ data: Record<string, unknown>[]; currentUser: Record<string, unknown> | null }> {
  const { period = 'all_time', halqaId, limit = 50, currentUserId } = options
  const safeLimit = Math.min(limit, 100)

  let dateFilter = ''
  if (period === 'weekly') {
    dateFilter = `AND pl.created_at >= NOW() - INTERVAL '7 days'`
  } else if (period === 'monthly') {
    dateFilter = `AND pl.created_at >= NOW() - INTERVAL '30 days'`
  }

  let halqaFilter = ''
  const params: unknown[] = [safeLimit]
  let paramIdx = 2

  if (halqaId) {
    halqaFilter = `AND up.halqa_id = $${paramIdx++}`
    params.push(halqaId)
  }

  let rows: Record<string, unknown>[]
  if (period === 'all_time') {
    rows = await query(
      `SELECT
         up.user_id,
         u.name as user_name,
         u.avatar_url,
         up.total_points,
         up.level as current_level,
         up.streak_days,
         up.halqa_id,
         h.name as halqa_name
       FROM user_points up
       JOIN users u ON u.id = up.user_id
       LEFT JOIN halaqat h ON h.id = up.halqa_id
       WHERE u.role IN ('student', 'reader') ${halqaFilter}
       ORDER BY up.total_points DESC
       LIMIT $1`,
      params,
    )
  } else {
    rows = await query(
      `SELECT
         pl.user_id,
         u.name as user_name,
         u.avatar_url,
         SUM(pl.points)::int as total_points,
         up.level as current_level,
         up.streak_days,
         up.halqa_id,
         h.name as halqa_name
       FROM points_log pl
       JOIN users u ON u.id = pl.user_id
       LEFT JOIN user_points up ON up.user_id = pl.user_id
       LEFT JOIN halaqat h ON h.id = up.halqa_id
       WHERE u.role IN ('student', 'reader') ${dateFilter} ${halqaFilter}
       GROUP BY pl.user_id, u.name, u.avatar_url, up.level, up.streak_days, up.halqa_id, h.name
       ORDER BY total_points DESC
       LIMIT $1`,
      params,
    )
  }

  const data = rows.map((r, i) => ({
    rank: i + 1,
    user_id: r.user_id,
    user_name: r.user_name,
    avatar_url: r.avatar_url ?? null,
    total_points: Number(r.total_points) || 0,
    current_level: r.current_level ?? 'beginner',
    streak_days: Number(r.streak_days) || 0,
    halqa_name: r.halqa_name ?? null,
    is_current_user: r.user_id === currentUserId,
  }))

  let currentUser = data.find(d => d.is_current_user) || null
  if (!currentUser && currentUserId && period === 'all_time') {
    const rank = await queryOne<{ rank: number; total_points: number; streak_days: number; level: string; halqa_name: string | null }>(
      `SELECT
         (SELECT COUNT(*) + 1 FROM user_points up2
          JOIN users u2 ON u2.id = up2.user_id
          WHERE u2.role IN ('student','reader')
            AND up2.total_points > up.total_points)::int as rank,
         up.total_points,
         up.streak_days,
         up.level,
         h.name as halqa_name
       FROM user_points up
       LEFT JOIN halaqat h ON h.id = up.halqa_id
       WHERE up.user_id = $1`,
      [currentUserId],
    )
    if (rank) {
      currentUser = {
        rank: rank.rank,
        user_id: currentUserId,
        user_name: '',
        avatar_url: null,
        total_points: rank.total_points,
        current_level: rank.level,
        streak_days: rank.streak_days,
        halqa_name: rank.halqa_name,
        is_current_user: true,
      }
    }
  }

  return { data, currentUser }
}
