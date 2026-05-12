'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Trash2, Plus, Loader2, BookOpen, Route } from 'lucide-react'
import { SURAHS } from '@/lib/data/surahs'

interface Restriction {
  id: string
  restriction_type: string
  target_id: string
  is_blocked: boolean
  created_at: string
}

interface LinkedChild {
  child_id: string
  child_name: string
}

export default function ContentRestrictionsPage() {
  const { locale } = useI18n()
  const isAr = locale === 'ar'
  const [children, setChildren] = useState<LinkedChild[]>([])
  const [selectedChild, setSelectedChild] = useState('')
  const [restrictions, setRestrictions] = useState<Restriction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newRestriction, setNewRestriction] = useState({ type: 'surah', target_id: '' })

  useEffect(() => { fetchChildren() }, [])

  useEffect(() => {
    if (selectedChild) fetchRestrictions(selectedChild)
  }, [selectedChild])

  const fetchChildren = async () => {
    try {
      const res = await fetch('/api/academy/parent/children')
      const data = await res.json()
      if (res.ok) {
        const kids = (data.children || []).map((c: any) => ({ child_id: c.child_id, child_name: c.child_name }))
        setChildren(kids)
        if (kids.length > 0) setSelectedChild(kids[0].child_id)
      }
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const fetchRestrictions = async (childId: string) => {
    try {
      const res = await fetch(`/api/academy/parent/content-restrictions?child_id=${childId}`)
      const data = await res.json()
      if (res.ok) setRestrictions(data.restrictions || [])
    } catch { /* ignore */ }
  }

  const addRestriction = async () => {
    if (!newRestriction.target_id || !selectedChild) return
    try {
      const res = await fetch('/api/academy/parent/content-restrictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: selectedChild,
          restriction_type: newRestriction.type,
          target_id: newRestriction.target_id,
          is_blocked: true,
        }),
      })
      if (res.ok) {
        setShowAdd(false)
        setNewRestriction({ type: 'surah', target_id: '' })
        fetchRestrictions(selectedChild)
      }
    } catch { /* ignore */ }
  }

  const removeRestriction = async (id: string) => {
    try {
      await fetch('/api/academy/parent/content-restrictions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restriction_id: id, child_id: selectedChild }),
      })
      setRestrictions(prev => prev.filter(r => r.id !== id))
    } catch { /* ignore */ }
  }

  const getTargetLabel = (type: string, targetId: string) => {
    if (type === 'surah') {
      const surah = SURAHS.find(s => String(s.number) === targetId)
      return surah ? `سورة ${surah.name}` : `سورة #${targetId}`
    }
    if (type === 'path') return isAr ? `مسار #${targetId}` : `Path #${targetId}`
    if (type === 'course') return isAr ? `دورة #${targetId}` : `Course #${targetId}`
    return targetId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? 'تقييد المحتوى' : 'Content Restrictions'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr ? 'حدد السور والمسارات المسموح بها لابنك' : 'Control which surahs and paths your child can access'}
          </p>
        </div>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{isAr ? 'لا يوجد أبناء مربوطين' : 'No linked children'}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <label className="text-sm font-bold">{isAr ? 'اختر الابن:' : 'Select child:'}</label>
            <select
              className="p-2 border rounded-lg bg-background"
              value={selectedChild}
              onChange={e => setSelectedChild(e.target.value)}
            >
              {children.map(c => <option key={c.child_id} value={c.child_id}>{c.child_name}</option>)}
            </select>
            <Button onClick={() => setShowAdd(true)} className="rounded-xl font-bold mr-auto">
              <Plus className="w-4 h-4 ml-2" />
              {isAr ? 'إضافة تقييد' : 'Add Restriction'}
            </Button>
          </div>

          {showAdd && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">{isAr ? 'إضافة تقييد جديد' : 'Add New Restriction'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{isAr ? 'نوع التقييد' : 'Restriction Type'}</label>
                  <select
                    className="w-full mt-1 p-2 border rounded-lg bg-background"
                    value={newRestriction.type}
                    onChange={e => setNewRestriction(r => ({ ...r, type: e.target.value, target_id: '' }))}
                  >
                    <option value="surah">{isAr ? 'سورة' : 'Surah'}</option>
                    <option value="path">{isAr ? 'مسار' : 'Path'}</option>
                    <option value="course">{isAr ? 'دورة' : 'Course'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {newRestriction.type === 'surah' ? (isAr ? 'اختر السورة' : 'Select Surah') : (isAr ? 'معرف المسار/الدورة' : 'Path/Course ID')}
                  </label>
                  {newRestriction.type === 'surah' ? (
                    <select
                      className="w-full mt-1 p-2 border rounded-lg bg-background"
                      value={newRestriction.target_id}
                      onChange={e => setNewRestriction(r => ({ ...r, target_id: e.target.value }))}
                    >
                      <option value="">{isAr ? '— اختر سورة —' : '— Select Surah —'}</option>
                      {SURAHS.map(s => (
                        <option key={s.number} value={String(s.number)}>
                          {s.number}. {s.name} ({s.verses} {isAr ? 'آية' : 'verses'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="w-full mt-1 p-2 border rounded-lg bg-background"
                      placeholder={isAr ? 'أدخل المعرف' : 'Enter ID'}
                      value={newRestriction.target_id}
                      onChange={e => setNewRestriction(r => ({ ...r, target_id: e.target.value }))}
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={addRestriction} className="rounded-xl font-bold">
                    {isAr ? 'إضافة' : 'Add'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <h3 className="text-lg font-bold">{isAr ? 'التقييدات الحالية' : 'Current Restrictions'}</h3>
            {restrictions.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-8 text-center">
                  <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {isAr ? 'لا توجد تقييدات — الابن يمكنه الوصول لجميع المحتوى' : 'No restrictions — child can access all content'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              restrictions.map(r => (
                <Card key={r.id} className="border-border/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        r.restriction_type === 'surah' ? 'bg-blue-500/10' : r.restriction_type === 'path' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                      }`}>
                        {r.restriction_type === 'surah' ? <BookOpen className="w-5 h-5 text-blue-500" /> : <Route className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{getTargetLabel(r.restriction_type, r.target_id)}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.restriction_type === 'surah' ? (isAr ? 'سورة' : 'Surah') : r.restriction_type === 'path' ? (isAr ? 'مسار' : 'Path') : (isAr ? 'دورة' : 'Course')}
                          {' — '}
                          {r.is_blocked ? (isAr ? 'محظور' : 'Blocked') : (isAr ? 'مسموح' : 'Allowed')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeRestriction(r.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
