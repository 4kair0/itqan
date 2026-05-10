'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Calendar, Clock, User as UserIcon, Video, ExternalLink, Sparkles, Share2, Copy, Check, BookOpen } from 'lucide-react'

interface PublicLesson {
  id: string
  slug: string
  title: string
  description: string | null
  cover_image_url: string | null
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  teacher: {
    name: string | null
    bio: string | null
    avatar: string | null
  }
  meeting: {
    link: string
    provider: string | null
    password: string | null
  } | null
}

type State = 'pre' | 'live' | 'post'

export function LessonViewer({ lesson, initialState }: { lesson: PublicLesson; initialState: State }) {
  const [state, setState] = useState<State>(initialState)
  const [now, setNow] = useState(() => new Date())
  const [meeting, setMeeting] = useState(lesson.meeting)
  const [copied, setCopied] = useState(false)
  const [joining, setJoining] = useState(false)
  const [signingUp, setSigningUp] = useState(false)

  const scheduledAt = useMemo(() => new Date(lesson.scheduled_at), [lesson.scheduled_at])
  const endsAt = useMemo(
    () => new Date(scheduledAt.getTime() + lesson.duration_minutes * 60_000),
    [scheduledAt, lesson.duration_minutes]
  )

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setNow(n)
      const t = n.getTime()
      if (t < scheduledAt.getTime()) setState('pre')
      else if (t <= endsAt.getTime()) setState('live')
      else setState('post')
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [scheduledAt, endsAt])

  const handleJoin = async () => {
    setJoining(true)
    try {
      const res = await fetch(`/api/public/lessons/${lesson.slug}/view`, { method: 'POST' })
      const data = await res.json()
      if (data.meeting?.link) {
        setMeeting(data.meeting)
        window.open(data.meeting.link, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setJoining(false)
    }
  }

  const handleSignupCta = async () => {
    setSigningUp(true)
    try {
      const res = await fetch(`/api/public/lessons/${lesson.slug}/signup-intent`, { method: 'POST' })
      const data = await res.json()
      window.location.href = data.redirect || `/register?ref=lesson&slug=${encodeURIComponent(lesson.slug)}`
    } catch {
      window.location.href = `/register?ref=lesson&slug=${encodeURIComponent(lesson.slug)}`
    }
  }

  const handleCopy = async () => {
    if (typeof window === 'undefined') return
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `${lesson.title} — درس عام مع ${lesson.teacher.name || 'منصة إتقان'}`

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header / cover */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
          {lesson.cover_image_url ? (
            <div className="relative w-full aspect-[16/9] bg-slate-100">
              <Image
                src={lesson.cover_image_url}
                alt={lesson.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 56rem, 100vw"
                priority
              />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-500 to-blue-600 aspect-[16/9] flex items-center justify-center">
              <BookOpen className="w-24 h-24 text-white/80" />
            </div>
          )}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{lesson.title}</h1>
              <StateBadge state={state} status={lesson.status} />
            </div>

            {lesson.description && (
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {lesson.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <UserIcon className="w-4 h-4" />
                {lesson.teacher.name || 'منصة إتقان'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {scheduledAt.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {scheduledAt.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                {' '}({lesson.duration_minutes} دقيقة)
              </span>
            </div>
          </div>
        </div>

        {/* Action panel — switches by state */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 sm:p-8">
          {state === 'pre' && <PreState scheduledAt={scheduledAt} now={now} />}
          {state === 'live' && (
            <LiveState
              meeting={meeting}
              joining={joining}
              onJoin={handleJoin}
            />
          )}
          {state === 'post' && (
            <PostState
              onSignup={handleSignupCta}
              signingUp={signingUp}
              teacherName={lesson.teacher.name}
            />
          )}
        </div>

        {/* Share */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Share2 className="w-4 h-4" /> شارك الدرس
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'تم النسخ' : 'نسخ الرابط'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 text-sm"
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm"
            >
              X
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              Facebook
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 py-6">
          <a href="/" className="hover:underline">منصة إتقان</a>
          {' · '}
          درس عام مفتوح للجميع
        </div>
      </div>
    </main>
  )
}

function StateBadge({ state, status }: { state: State; status: PublicLesson['status'] }) {
  if (status === 'cancelled') {
    return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">ملغي</span>
  }
  if (state === 'live') {
    return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 animate-pulse">مباشر الآن</span>
  }
  if (state === 'pre') {
    return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">قريباً</span>
  }
  return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">انتهى</span>
}

function PreState({ scheduledAt, now }: { scheduledAt: Date; now: Date }) {
  const ms = Math.max(0, scheduledAt.getTime() - now.getTime())
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const seconds = Math.floor((ms / 1000) % 60)

  return (
    <div className="text-center space-y-4">
      <div className="text-sm text-slate-600 dark:text-slate-400">يبدأ الدرس بعد</div>
      <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
        {[
          { v: days, l: 'يوم' },
          { v: hours, l: 'ساعة' },
          { v: minutes, l: 'دقيقة' },
          { v: seconds, l: 'ثانية' },
        ].map(({ v, l }) => (
          <div key={l} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
            <div className="text-2xl sm:text-3xl font-bold tabular-nums">{String(v).padStart(2, '0')}</div>
            <div className="text-xs text-slate-500 mt-1">{l}</div>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-500 pt-2">
        احفظ الصفحة في المفضلة وارجع عند بدء الدرس لتنضم مباشرة.
      </p>
    </div>
  )
}

function LiveState({
  meeting,
  joining,
  onJoin,
}: {
  meeting: PublicLesson['meeting']
  joining: boolean
  onJoin: () => void
}) {
  if (!meeting?.link) {
    return (
      <div className="text-center py-6">
        <div className="text-lg font-semibold mb-1">الدرس بدأ، لكن لم يضع المدرس الرابط بعد.</div>
        <div className="text-sm text-slate-500">حدّث الصفحة بعد قليل.</div>
      </div>
    )
  }
  return (
    <div className="text-center space-y-4">
      <div className="text-2xl font-bold flex items-center justify-center gap-2 text-red-600">
        <span className="inline-block w-3 h-3 rounded-full bg-red-600 animate-pulse" />
        الدرس مباشر الآن
      </div>
      <button
        onClick={onJoin}
        disabled={joining}
        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-lg font-semibold transition-colors disabled:opacity-50 w-full sm:w-auto"
      >
        <Video className="w-5 h-5" />
        {joining ? 'جاري فتح الدرس...' : 'انضم إلى الدرس الآن'}
        <ExternalLink className="w-4 h-4" />
      </button>
      {meeting.password && (
        <div className="text-sm text-slate-600 dark:text-slate-400" dir="ltr">
          كلمة المرور: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{meeting.password}</code>
        </div>
      )}
      {meeting.provider && (
        <div className="text-xs text-slate-500">
          {meeting.provider === 'zoom' ? 'عبر Zoom' : meeting.provider === 'google_meet' ? 'عبر Google Meet' : ''}
        </div>
      )}
    </div>
  )
}

function PostState({ onSignup, signingUp, teacherName }: {
  onSignup: () => void
  signingUp: boolean
  teacherName: string | null
}) {
  return (
    <div className="text-center space-y-5">
      <Sparkles className="w-14 h-14 mx-auto text-amber-500" />
      <div>
        <h2 className="text-2xl font-bold mb-2">شكراً لحضورك الدرس 🌟</h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          أعجبك الدرس مع {teacherName || 'مدرسنا'}؟ سجّل في منصة إتقان وانضم إلى دورات كاملة، جلسات حية، وقراءات مع شيوخ متخصصين.
        </p>
      </div>
      <button
        onClick={onSignup}
        disabled={signingUp}
        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold transition-colors disabled:opacity-50 w-full sm:w-auto"
      >
        {signingUp ? 'جاري التحويل...' : 'سجّل الآن مجاناً'}
      </button>
      <p className="text-xs text-slate-500 pt-2">
        التسجيل سريع ومجاني، وستحصل على إشعارات بالدروس القادمة.
      </p>
    </div>
  )
}
