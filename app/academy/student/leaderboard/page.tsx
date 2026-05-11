"use client"

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import { Trophy, Medal, Star, Flame, Crown, TrendingUp, Filter } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  user_id: string
  user_name: string
  avatar_url?: string
  total_points: number
  current_level: number
  streak_days: number
  is_current_user: boolean
  halqa_name?: string | null
}

interface Halqa {
  id: string
  name: string
}

export default function LeaderboardPage() {
  const { t } = useI18n()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('weekly')
  const [halqaId, setHalqaId] = useState<string>('')
  const [halaqat, setHalaqat] = useState<Halqa[]>([])

  useEffect(() => {
    async function fetchHalaqat() {
      try {
        const res = await fetch('/api/academy/admin/halaqat')
        if (res.ok) {
          const data = await res.json()
          setHalaqat(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch halaqat:', error)
      }
    }
    fetchHalaqat()
  }, [])

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ period, limit: '50' })
        if (halqaId) params.set('halqa_id', halqaId)
        const res = await fetch(`/api/academy/leaderboard?${params}`)
        if (res.ok) {
          const data = await res.json()
          setLeaderboard(data.data || [])
          setCurrentUserRank(data.current_user || null)
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [period, halqaId])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>
  }

  const getRankBackground = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-l from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-900/10 border-yellow-300 dark:border-yellow-700'
    if (rank === 2) return 'bg-gradient-to-l from-gray-100 to-gray-50 dark:from-gray-800/20 dark:to-gray-800/10 border-gray-300 dark:border-gray-700'
    if (rank === 3) return 'bg-gradient-to-l from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-300 dark:border-amber-700'
    return 'bg-card border-border'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" />
            {t.academy?.leaderboard || 'لوحة المتصدرين'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.academy?.leaderboardDesc || 'تنافس مع زملائك واكسب المراكز الأولى'}
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2">
          {(['weekly', 'monthly', 'all_time'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {p === 'weekly' && (t.academy?.weekly || 'أسبوعي')}
              {p === 'monthly' && (t.academy?.monthly || 'شهري')}
              {p === 'all_time' && (t.academy?.allTime || 'الكل')}
            </button>
          ))}
        </div>
      </div>

      {/* Halqa Filter */}
      {halaqat.length > 0 && (
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={halqaId}
            onChange={e => setHalqaId(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-muted border border-border"
          >
            <option value="">كل المنصة</option>
            {halaqat.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Current User Position */}
      {currentUserRank && currentUserRank.rank > 10 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
            {t.academy?.yourPosition || 'ترتيبك الحالي'}
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              {currentUserRank.rank}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{currentUserRank.user_name}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {currentUserRank.total_points} {t.academy?.points || 'نقطة'}
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {currentUserRank.streak_days} {t.academy?.days || 'يوم'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      {leaderboard.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">لا توجد بيانات بعد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.user_id}
              className={cn(
                "border rounded-xl p-4 transition-all",
                getRankBackground(entry.rank),
                entry.is_current_user && "ring-2 ring-blue-400 dark:ring-blue-600"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {entry.avatar_url ? (
                  <img src={entry.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                    {entry.user_name?.charAt(0) || '?'}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">
                      {entry.user_name}
                      {entry.is_current_user && <span className="text-xs text-blue-500 mr-1">(أنت)</span>}
                    </p>
                  </div>
                  {entry.halqa_name && (
                    <p className="text-xs text-muted-foreground">{entry.halqa_name}</p>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-4 h-4" />
                      {entry.total_points}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{t.academy?.points || 'نقطة'}</p>
                  </div>
                  <div className="text-center">
                    <p className="flex items-center gap-1 font-bold text-orange-500">
                      <Flame className="w-4 h-4" />
                      {entry.streak_days}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{t.academy?.days || 'يوم'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
