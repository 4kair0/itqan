'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, ShieldCheck, ShieldX, UserCircle2, Mail, Check, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

interface PendingRequest {
  id: string
  parent_id: string
  parent_name: string
  parent_email: string
  parent_avatar: string | null
  relation: string
  requested_at: string
  link_code_expires_at: string | null
}

const RELATION_LABELS: Record<string, { ar: string; en: string }> = {
  father: { ar: 'أب', en: 'Father' },
  mother: { ar: 'أم', en: 'Mother' },
  guardian: { ar: 'ولي أمر آخر', en: 'Other Guardian' },
}

export default function StudentParentRequestsPage() {
  const { locale } = useI18n()
  const isAr = locale === 'ar'
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState<Record<string, string>>({})
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/academy/student/parent-requests')
      const data = await res.json()
      if (res.ok) setRequests(data.requests || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAction = async (id: string, action: 'confirm' | 'reject') => {
    setSubmittingId(id)
    setMessage(null)
    try {
      const res = await fetch('/api/academy/student/parent-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          code: action === 'confirm' ? code[id] : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({
          kind: 'err',
          text: data.error || (isAr ? 'فشل التنفيذ' : 'Action failed'),
        })
      } else {
        setMessage({
          kind: 'ok',
          text:
            action === 'confirm'
              ? isAr
                ? 'تم قبول طلب الربط'
                : 'Link request confirmed'
              : isAr
              ? 'تم رفض الطلب'
              : 'Request rejected',
        })
        await load()
      }
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          {isAr ? 'طلبات ولي الأمر' : 'Parent Requests'}
        </div>
        <h1 className="text-3xl font-black">
          {isAr ? 'إدارة ربط ولي الأمر' : 'Manage Parent Linking'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isAr
            ? 'هنا تظهر طلبات الربط المرسلة من أولياء الأمور. اقبل الطلب فقط بعد التحقق من هوية المرسل والكود الذي تلقيته.'
            : 'Pending parent link requests appear here. Confirm only after verifying the sender and the code you received.'}
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border ${
            message.kind === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
              : 'bg-red-500/10 border-red-500/30 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <ShieldX className="w-10 h-10 mx-auto mb-3 opacity-60" />
            <p>{isAr ? 'لا توجد طلبات ربط معلقة.' : 'No pending link requests.'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const rel = RELATION_LABELS[r.relation]
            const expires = r.link_code_expires_at
              ? new Date(r.link_code_expires_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')
              : null
            return (
              <Card key={r.id} className="border-border/50 rounded-3xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <UserCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold">{r.parent_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" dir="ltr">
                        <Mail className="w-3 h-3" /> {r.parent_email}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {isAr ? 'صفة:' : 'Relation:'}{' '}
                        <span className="font-semibold text-foreground">
                          {rel ? (isAr ? rel.ar : rel.en) : r.relation}
                        </span>
                      </div>
                      {expires && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {isAr ? `صالح حتى ${expires}` : `Expires ${expires}`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <Input
                      placeholder={isAr ? 'أدخل كود التأكيد المُستلم' : 'Enter confirmation code'}
                      value={code[r.id] || ''}
                      onChange={(e) => setCode({ ...code, [r.id]: e.target.value })}
                      className="h-12 flex-1 text-center font-mono tracking-widest"
                      maxLength={8}
                      dir="ltr"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAction(r.id, 'confirm')}
                        disabled={submittingId === r.id || !(code[r.id] && code[r.id].length >= 4)}
                        className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {submittingId === r.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 me-1" />
                            {isAr ? 'قبول' : 'Confirm'}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAction(r.id, 'reject')}
                        disabled={submittingId === r.id}
                        className="h-12 px-6 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 me-1" />
                        {isAr ? 'رفض' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
