'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  BookOpen,
  Plus,
  Loader2,
  Library,
  Clock,
  CheckCircle2,
  HelpCircle,
  Send,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

interface Question {
  id: string
  title: string | null
  question: string
  answer: string | null
  category_id: string | null
  category_slug: string | null
  category_name_ar: string | null
  status: string
  publish_consent: string
  is_anonymous: boolean
  is_published: boolean
  asked_at: string
  answered_at: string | null
  officer_name: string | null
}

interface Category {
  id: string
  slug: string
  name_ar: string
  name_en: string | null
}

const STATUS_LABELS: Record<string, { ar: string; cls: string }> = {
  pending: { ar: 'في الانتظار', cls: 'bg-amber-100 text-amber-700' },
  assigned: { ar: 'لدى المسؤول', cls: 'bg-blue-100 text-blue-700' },
  in_progress: { ar: 'محادثة جارية', cls: 'bg-blue-100 text-blue-700' },
  awaiting_consent: { ar: 'بحاجة لموافقتك', cls: 'bg-purple-100 text-purple-700' },
  published: { ar: 'منشور', cls: 'bg-emerald-100 text-emerald-700' },
  closed: { ar: 'مغلق', cls: 'bg-slate-100 text-slate-700' },
  declined: { ar: 'مرفوض', cls: 'bg-red-100 text-red-700' },
}

export default function StudentFiqhPage() {
  const { locale } = useI18n()
  const isAr = locale === 'ar'
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight

  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAskOpen, setIsAskOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [qres, cres] = await Promise.all([
        fetch('/api/academy/fiqh?view=mine').then((r) => r.json()),
        fetch('/api/academy/fiqh/categories').then((r) => r.json()),
      ])
      if (qres.questions) setQuestions(qres.questions)
      if (cres.categories) {
        setCategories(cres.categories)
        if (!categoryId && cres.categories[0]) setCategoryId(cres.categories[0].id)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async () => {
    if (!body.trim() || !categoryId) return
    setSubmitting(true)
    setFeedback(null)
    try {
      const res = await fetch('/api/academy/fiqh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || null,
          question: body.trim(),
          category_id: categoryId,
          is_anonymous: isAnonymous,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFeedback({ kind: 'err', text: data.error || 'فشل الإرسال' })
      } else {
        setFeedback({
          kind: 'ok',
          text: data.assigned
            ? `تم إرسال سؤالك للمسؤول (${data.officer_name || ''}). ستصلك الإجابة قريباً.`
            : 'تم استلام سؤالك. سيقوم الإداري بتعيين مسؤول للإجابة عليه.',
        })
        setTitle('')
        setBody('')
        setIsAnonymous(false)
        setIsAskOpen(false)
        await load()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            {isAr ? 'الأسئلة الفقهية' : 'Fiqh Questions'}
          </div>
          <h1 className="text-3xl font-black">{isAr ? 'أسئلتي الفقهية' : 'My Fiqh Questions'}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {isAr
              ? 'اطرح سؤالك الفقهي وسيقوم مسؤول متخصص بالرد عليك. بعد الإجابة يمكنك السماح بنشر السؤال في المكتبة العامة لينتفع به الآخرون.'
              : "Submit your question and a specialized officer will respond. After answering, you may consent to publish it in the public library."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/academy/fiqh">
              <Library className="w-4 h-4 me-2" />
              {isAr ? 'المكتبة العامة' : 'Public library'}
            </Link>
          </Button>
          <Button onClick={() => setIsAskOpen(true)}>
            <Plus className="w-4 h-4 me-2" />
            {isAr ? 'إرسال سؤال جديد' : 'Ask a question'}
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-sm ${
            feedback.kind === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
              : 'bg-red-500/10 border-red-500/30 text-red-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground space-y-4">
            <HelpCircle className="w-10 h-10 mx-auto opacity-60" />
            <p>{isAr ? 'لم تقم بإرسال أي سؤال بعد.' : 'No questions yet.'}</p>
            <Button onClick={() => setIsAskOpen(true)}>
              <Plus className="w-4 h-4 me-2" />
              {isAr ? 'أرسل أول سؤال' : 'Ask your first question'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const status = STATUS_LABELS[q.status] || { ar: q.status, cls: 'bg-slate-100 text-slate-700' }
            return (
              <Link
                key={q.id}
                href={`/academy/student/fiqh/${q.id}`}
                className="block"
              >
                <Card className="rounded-2xl hover:bg-muted/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {q.category_name_ar && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                              {q.category_name_ar}
                            </span>
                          )}
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${status.cls}`}>
                            {status.ar}
                          </span>
                          {q.is_anonymous && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {isAr ? 'مجهول' : 'Anonymous'}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg">
                          {q.title || q.question.slice(0, 80) + (q.question.length > 80 ? '…' : '')}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{q.question}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(q.asked_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                          {q.officer_name && (
                            <span>• {isAr ? `المسؤول: ${q.officer_name}` : `Officer: ${q.officer_name}`}</span>
                          )}
                        </div>
                      </div>
                      <ChevronIcon className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      <Dialog open={isAskOpen} onOpenChange={setIsAskOpen}>
        <DialogContent className="max-w-lg" dir={isAr ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{isAr ? 'إرسال سؤال فقهي جديد' : 'Ask a fiqh question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-bold block mb-1">{isAr ? 'التصنيف' : 'Category'}</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border bg-card"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ar}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">{isAr ? 'العنوان (اختياري)' : 'Title (optional)'}</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAr ? 'مثال: حكم قصر الصلاة في السفر' : 'e.g., Shortening prayer while traveling'}
              />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">{isAr ? 'نص السؤال' : 'Question'}</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={isAr ? 'اكتب سؤالك بوضوح...' : 'Write your question clearly...'}
                rows={6}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={isAnonymous} onCheckedChange={(v) => setIsAnonymous(!!v)} />
              <span className="text-sm">
                {isAr ? 'إخفاء اسمي عن المسؤول والمكتبة العامة' : 'Hide my name from the officer and public library'}
              </span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAskOpen(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={submit} disabled={submitting || !body.trim() || !categoryId}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Send className="w-4 h-4 me-2" />
                  {isAr ? 'إرسال' : 'Send'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
