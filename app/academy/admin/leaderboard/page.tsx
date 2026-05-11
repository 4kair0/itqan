'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Flame, Medal, Star, TrendingUp } from 'lucide-react'

interface LeaderboardEntry {
  user_id: string
  name: string
  email: string
  total_points: number
  level: string
  streak_days: number
  longest_streak: number
  badges_count: number
  tasks_completed: number
  total_verses_memorized: number
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
  hafiz: 'حافظ',
  master: 'ماهر',
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  advanced: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  hafiz: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  master: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

export default function AdminLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/academy/admin/leaderboard')
        if (res.ok) {
          const json = await res.json()
          setLeaderboard(json.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  const totalStudents = leaderboard.length
  const totalPoints = leaderboard.reduce((sum, e) => sum + (e.total_points || 0), 0)
  const avgStreak = totalStudents > 0
    ? Math.round(leaderboard.reduce((sum, e) => sum + (e.streak_days || 0), 0) / totalStudents)
    : 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">لوحة المتصدرين — إدارة النقاط</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <p className="text-3xl font-bold text-amber-600">{totalPoints.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">إجمالي النقاط</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
            <p className="text-sm text-muted-foreground">عدد الطلاب</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-3xl font-bold text-orange-600">{avgStreak}</p>
            <p className="text-sm text-muted-foreground">متوسط الـ Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <Card key={entry.user_id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold w-10 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{entry.name}</p>
                    <p className="text-sm text-muted-foreground">{entry.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[entry.level] || LEVEL_COLORS.beginner}`}>
                      {LEVEL_LABELS[entry.level] || 'مبتدئ'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">النقاط</p>
                    <p className="text-2xl font-bold text-amber-600">{entry.total_points || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Streak</p>
                    <p className="text-xl font-bold text-orange-600 flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      {entry.streak_days || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">المهام</p>
                    <p className="text-xl font-bold text-blue-600">{entry.tasks_completed || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">الشارات</p>
                    <p className="text-xl font-bold text-purple-600">{entry.badges_count || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <Card className="text-center py-12">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">لا توجد بيانات</p>
        </Card>
      )}
    </div>
  )
}
