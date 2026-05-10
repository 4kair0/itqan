'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, Plus, Edit2, Video, Link2, UserCircle } from 'lucide-react'
import { SendMeetingLinkModal } from '@/components/academy/send-meeting-link-modal'

interface TeacherSession {
  id: string
  course_id: string
  title: string
  description?: string | null
  scheduled_at: string
  duration_minutes: number
  status: string
  meeting_link?: string | null
  meeting_provider?: string | null
  meeting_password?: string | null
  course_title?: string | null
  enrolled_count?: number | null
  attendance_count?: number | null
  personal_invites_count?: number | null
}

export default function TeacherSchedulePage() {
  const [sessions, setSessions] = useState<TeacherSession[]>([])
  const [loading, setLoading] = useState(true)
  const [linkModalSessionId, setLinkModalSessionId] = useState<string | null>(null)

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/academy/teacher/sessions')
      if (res.ok) {
        const data = await res.json()
        const list: TeacherSession[] = Array.isArray(data) ? data : data.data || []
        setSessions(list)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSessions() }, [])

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>
  }

  const upcomingSessions = sessions.filter(s => new Date(s.scheduled_at) > new Date())
  const pastSessions = sessions.filter(s => new Date(s.scheduled_at) <= new Date())

  const activeModalSession = linkModalSessionId
    ? sessions.find(s => s.id === linkModalSessionId)
    : null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">الجدول</h1>
        <Button>
          <Plus className="w-4 h-4 ml-2" />
          جلسة جديدة
        </Button>
      </div>

      {upcomingSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">الجلسات القادمة</h2>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onOpenLinkModal={() => setLinkModalSessionId(session.id)}
              />
            ))}
          </div>
        </div>
      )}

      {pastSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">الجلسات السابقة</h2>
          <div className="space-y-2">
            {pastSessions.slice(0, 5).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                past
                onOpenLinkModal={() => setLinkModalSessionId(session.id)}
              />
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <Card className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">لا توجد جلسات مجدولة</p>
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            جدول جلسة جديدة
          </Button>
        </Card>
      )}

      {activeModalSession && (
        <SendMeetingLinkModal
          open
          onClose={() => setLinkModalSessionId(null)}
          sessionId={activeModalSession.id}
          sessionTitle={activeModalSession.title}
          onSent={() => { fetchSessions() }}
        />
      )}
    </div>
  )
}

function SessionCard({
  session,
  past,
  onOpenLinkModal,
}: {
  session: TeacherSession
  past?: boolean
  onOpenLinkModal: () => void
}) {
  const hasLink = !!session.meeting_link
  const hasPersonalInvites = (session.personal_invites_count || 0) > 0

  return (
    <Card className={past ? '' : 'hover:shadow-md transition-shadow'}>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{session.title}</h3>
              {hasLink && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <Link2 className="w-3 h-3 me-1" />
                  لينك مرسل
                </Badge>
              )}
              {hasPersonalInvites && (
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  <UserCircle className="w-3 h-3 me-1" />
                  {session.personal_invites_count} روابط خاصة
                </Badge>
              )}
            </div>
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
              {session.course_title && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {session.course_title}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(session.scheduled_at).toLocaleDateString('ar-EG')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(session.scheduled_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {session.enrolled_count || 0} طالب
              </div>
            </div>
            {hasLink && (
              <div className="text-xs text-muted-foreground break-all" dir="ltr">
                {session.meeting_link}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={onOpenLinkModal}>
              <Video className="w-4 h-4 me-1" />
              {hasLink ? 'تعديل اللينك' : 'إرسال لينك'}
            </Button>
            {!past && (
              <Button size="sm">ابدأ الآن</Button>
            )}
            {past && (
              <Button size="sm" variant="outline">عرض التفاصيل</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
