'use client'

import { useState, useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send, Plus, ArrowRight, Loader2, User } from 'lucide-react'

interface Conversation {
  id: string
  teacher_id: string
  teacher_name: string
  teacher_email: string
  child_id: string
  child_name: string
  subject: string
  last_message: string | null
  last_message_at: string | null
  unread_count_parent: number
  created_at: string
}

interface Message {
  id: string
  sender_id: string
  sender_name: string
  content: string
  is_read: boolean
  created_at: string
}

interface LinkedChild {
  child_id: string
  child_name: string
}

export default function ParentMessagesPage() {
  const { locale } = useI18n()
  const isAr = locale === 'ar'
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMsg, setSendingMsg] = useState(false)
  const [showNewConv, setShowNewConv] = useState(false)
  const [children, setChildren] = useState<LinkedChild[]>([])
  const [newConvForm, setNewConvForm] = useState({ teacher_id: '', child_id: '', subject: '', message: '' })
  const [teachers, setTeachers] = useState<{ id: string; name: string; email: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
    fetchChildren()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/academy/parent/conversations')
      const data = await res.json()
      if (res.ok) setConversations(data.conversations || [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const fetchChildren = async () => {
    try {
      const res = await fetch('/api/academy/parent/children')
      const data = await res.json()
      if (res.ok) setChildren((data.children || []).map((c: any) => ({ child_id: c.child_id, child_name: c.child_name })))
    } catch { /* ignore */ }
  }

  const fetchTeachersForChild = async (childId: string) => {
    try {
      const res = await fetch(`/api/academy/parent/children/${childId}/reports`)
      const data = await res.json()
      if (res.ok && data.courses) {
        const unique = new Map<string, { id: string; name: string; email: string }>()
        data.courses.forEach((c: any) => {
          if (c.teacher_id) unique.set(c.teacher_id, { id: c.teacher_id, name: c.teacher_name || 'معلم', email: '' })
        })
        setTeachers(Array.from(unique.values()))
      }
    } catch { /* ignore */ }
  }

  const selectConversation = async (conv: Conversation) => {
    setSelectedConv(conv)
    try {
      const res = await fetch(`/api/academy/parent/conversations/${conv.id}/messages`)
      const data = await res.json()
      if (res.ok) setMessages(data.messages || [])
    } catch { /* ignore */ }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return
    setSendingMsg(true)
    try {
      const res = await fetch(`/api/academy/parent/conversations/${selectedConv.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      })
      const data = await res.json()
      if (res.ok && data.message) {
        setMessages(prev => [...prev, { ...data.message, sender_name: isAr ? 'أنت' : 'You' }])
        setNewMessage('')
      }
    } catch { /* ignore */ } finally { setSendingMsg(false) }
  }

  const createConversation = async () => {
    if (!newConvForm.teacher_id || !newConvForm.child_id || !newConvForm.subject) return
    try {
      const res = await fetch('/api/academy/parent/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConvForm),
      })
      if (res.ok) {
        setShowNewConv(false)
        setNewConvForm({ teacher_id: '', child_id: '', subject: '', message: '' })
        fetchConversations()
      }
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? 'الرسائل — تواصل مع الشيخ' : 'Messages — Contact Teacher'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr ? 'تواصل مباشرة مع معلمي أبنائك' : 'Communicate directly with your children\'s teachers'}
          </p>
        </div>
        <Button onClick={() => setShowNewConv(true)} className="rounded-xl font-bold">
          <Plus className="w-4 h-4 ml-2" />
          {isAr ? 'محادثة جديدة' : 'New Chat'}
        </Button>
      </div>

      {showNewConv && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">{isAr ? 'بدء محادثة جديدة' : 'Start New Conversation'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">{isAr ? 'اختر الابن' : 'Select Child'}</label>
              <select
                className="w-full mt-1 p-2 border rounded-lg bg-background"
                value={newConvForm.child_id}
                onChange={e => {
                  setNewConvForm(f => ({ ...f, child_id: e.target.value }))
                  if (e.target.value) fetchTeachersForChild(e.target.value)
                }}
              >
                <option value="">{isAr ? '— اختر —' : '— Select —'}</option>
                {children.map(c => <option key={c.child_id} value={c.child_id}>{c.child_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{isAr ? 'اختر المعلم/الشيخ' : 'Select Teacher'}</label>
              <select
                className="w-full mt-1 p-2 border rounded-lg bg-background"
                value={newConvForm.teacher_id}
                onChange={e => setNewConvForm(f => ({ ...f, teacher_id: e.target.value }))}
              >
                <option value="">{isAr ? '— اختر —' : '— Select —'}</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {teachers.length === 0 && newConvForm.child_id && (
                <div className="mt-2">
                  <label className="text-sm font-medium text-muted-foreground">{isAr ? 'أو أدخل معرف المعلم' : 'Or enter teacher ID'}</label>
                  <Input
                    className="mt-1"
                    placeholder={isAr ? 'معرف المعلم' : 'Teacher ID'}
                    value={newConvForm.teacher_id}
                    onChange={e => setNewConvForm(f => ({ ...f, teacher_id: e.target.value }))}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">{isAr ? 'الموضوع' : 'Subject'}</label>
              <Input
                className="mt-1"
                placeholder={isAr ? 'موضوع المحادثة' : 'Conversation subject'}
                value={newConvForm.subject}
                onChange={e => setNewConvForm(f => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{isAr ? 'الرسالة الأولى (اختياري)' : 'First message (optional)'}</label>
              <Textarea
                className="mt-1"
                placeholder={isAr ? 'اكتب رسالتك...' : 'Write your message...'}
                value={newConvForm.message}
                onChange={e => setNewConvForm(f => ({ ...f, message: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createConversation} className="rounded-xl font-bold">
                {isAr ? 'إرسال' : 'Send'}
              </Button>
              <Button variant="outline" onClick={() => setShowNewConv(false)} className="rounded-xl">
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold">{isAr ? 'المحادثات' : 'Conversations'}</h3>
          {conversations.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{isAr ? 'لا توجد محادثات بعد' : 'No conversations yet'}</p>
              </CardContent>
            </Card>
          ) : (
            conversations.map(conv => (
              <Card
                key={conv.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedConv?.id === conv.id ? 'border-primary shadow-md' : 'border-border/50'}`}
                onClick={() => selectConversation(conv)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{conv.teacher_name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{conv.subject}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1 truncate">{conv.child_name}</p>
                      {conv.last_message && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{conv.last_message}</p>
                      )}
                    </div>
                    {conv.unread_count_parent > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {conv.unread_count_parent}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Messages Panel */}
        <div className="lg:col-span-2">
          {selectedConv ? (
            <Card className="border-border/50 h-[600px] flex flex-col">
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSelectedConv(null)}>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <div>
                    <CardTitle className="text-base">{selectedConv.teacher_name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{selectedConv.subject} — {selectedConv.child_name}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === selectedConv.teacher_id ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.sender_id === selectedConv.teacher_id
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      <p className="text-xs font-bold mb-1 opacity-70">{msg.sender_name}</p>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[10px] opacity-50 mt-1">
                        {new Date(msg.created_at).toLocaleString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    className="flex-1 rounded-xl"
                    placeholder={isAr ? 'اكتب رسالتك...' : 'Type a message...'}
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={sendingMsg}
                  />
                  <Button onClick={sendMessage} disabled={sendingMsg || !newMessage.trim()} className="rounded-xl">
                    {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-border/50 h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold">{isAr ? 'اختر محادثة للبدء' : 'Select a conversation'}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
