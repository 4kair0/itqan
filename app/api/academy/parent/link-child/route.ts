import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query, queryOne } from '@/lib/db'
import { generateLinkCode } from '@/lib/parent-helpers'
import { createNotification } from '@/lib/notifications'
import { sendEmail } from '@/lib/email'

// POST: Search for a student OR send a link request
// Actions:
//   { action: "search", email }
//   { action: "request", child_id, relation }
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || (session.role !== 'parent' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const body = await req.json()
  const { action, email, child_id, relation, child_gender } = body

  // Action 1: Search for a student by email
  if (action === 'search') {
    if (!email) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 })
    }

    const student = await queryOne<{
      id: string
      name: string
      email: string
      avatar_url: string | null
      role: string
    }>(
      `SELECT id, name, email, avatar_url, role FROM users WHERE email = $1 AND role = 'student' LIMIT 1`,
      [email.toLowerCase()]
    )

    if (!student) {
      return NextResponse.json(
        { error: 'لم يتم العثور على طالب بهذا البريد الإلكتروني' },
        { status: 404 }
      )
    }

    // Check existing link
    const existing = await queryOne<{ status: string }>(
      `SELECT status FROM parent_children
       WHERE parent_id = $1 AND child_id = $2
       ORDER BY created_at DESC LIMIT 1`,
      [session.sub, student.id]
    )

    if (existing && existing.status === 'active') {
      return NextResponse.json(
        { error: 'هذا الطالب مربوط بحسابك بالفعل' },
        { status: 409 }
      )
    }
    if (existing && existing.status === 'pending') {
      return NextResponse.json(
        { error: 'لديك طلب ربط معلق لهذا الطالب بالفعل' },
        { status: 409 }
      )
    }

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        avatar_url: student.avatar_url,
      },
    })
  }

  // Action 2: Send a link request (creates pending row + notifies child)
  if (action === 'request' || action === 'link') {
    if (!child_id || !relation) {
      return NextResponse.json(
        { error: 'معرف الطالب ونوع العلاقة مطلوبان' },
        { status: 400 }
      )
    }

    // Verify student exists
    const student = await queryOne<{ id: string; name: string; email: string }>(
      `SELECT id, name, email FROM users WHERE id = $1 AND role = 'student'`,
      [child_id]
    )

    if (!student) {
      return NextResponse.json({ error: 'الطالب غير موجود' }, { status: 404 })
    }

    // Reject if any active link already
    const existingActive = await queryOne<{ id: string }>(
      `SELECT id FROM parent_children
       WHERE parent_id = $1 AND child_id = $2 AND status = 'active'`,
      [session.sub, child_id]
    )
    if (existingActive) {
      return NextResponse.json(
        { error: 'هذا الطالب مربوط بحسابك بالفعل' },
        { status: 409 }
      )
    }

    // Reject if there is already a pending request
    const existingPending = await queryOne<{ id: string }>(
      `SELECT id FROM parent_children
       WHERE parent_id = $1 AND child_id = $2 AND status = 'pending'`,
      [session.sub, child_id]
    )
    if (existingPending) {
      return NextResponse.json(
        { error: 'لديك طلب ربط معلق لهذا الطالب' },
        { status: 409 }
      )
    }

    const code = generateLinkCode()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Reuse old rejected/removed rows via UPSERT
    const validGender = child_gender === 'male' || child_gender === 'female' ? child_gender : null

    const inserted = await query<{ id: string }>(
      `INSERT INTO parent_children
        (parent_id, child_id, relation, child_gender, status, link_code, link_code_expires_at, requested_at)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, NOW())
       ON CONFLICT (parent_id, child_id) DO UPDATE
         SET relation = EXCLUDED.relation,
             child_gender = COALESCE(EXCLUDED.child_gender, parent_children.child_gender),
             status = 'pending',
             link_code = EXCLUDED.link_code,
             link_code_expires_at = EXCLUDED.link_code_expires_at,
             requested_at = NOW(),
             rejected_at = NULL,
             confirmed_at = NULL,
             updated_at = NOW()
       RETURNING id`,
      [session.sub, child_id, relation, validGender, code, expiresAt.toISOString()]
    )

    if (!inserted[0]) {
      return NextResponse.json({ error: 'فشل في إرسال طلب الربط' }, { status: 500 })
    }

    // Lookup parent name for the message
    const parent = await queryOne<{ name: string; email: string }>(
      `SELECT name, email FROM users WHERE id = $1`,
      [session.sub]
    )

    // In-app notification for the child
    await createNotification({
      userId: child_id,
      type: 'general',
      title: 'طلب ربط ولي أمر جديد',
      message: `أرسل ${parent?.name || 'ولي أمر'} طلب ربط حسابك. كود التأكيد: ${code}`,
      category: 'account',
      link: '/academy/student/parent-requests',
    })

    // Email the child
    if (student.email) {
      try {
        await sendEmail({
          to: student.email,
          subject: 'طلب ربط حساب ولي الأمر — إتقان التعليمية',
          body: `أرسل ${parent?.name || 'ولي أمر'} طلب ربط حسابك. كود التأكيد: ${code}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color:#0B3D2E;">طلب ربط ولي أمر جديد</h2>
              <p style="color:#475569; line-height: 1.7;">
                مرحباً ${student.name}،<br/>
                أرسل <strong>${parent?.name || 'ولي أمر'}</strong> طلب ربط حسابك بحسابه على منصة إتقان التعليمية لمتابعة تقدمك الأكاديمي.
              </p>
              <div style="background:#f8fafc; padding:18px; text-align:center; border-radius:10px; margin:18px 0;">
                <p style="margin:0 0 6px; color:#64748b; font-size: 13px;">كود التأكيد</p>
                <span style="font-size:30px; font-weight:bold; letter-spacing:6px; color:#D4A843;">${code}</span>
              </div>
              <p style="color:#64748b; font-size:14px;">يمكنك قبول أو رفض الطلب من صفحة طلبات الربط في حسابك.</p>
              <p style="color:#94a3b8; font-size:12px; text-align:center;">صلاحية الكود 7 أيام.</p>
            </div>
          `,
        })
      } catch (err) {
        console.warn('[parent link] email send failed:', err)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلب الربط للطالب. سيظهر الربط بعد موافقته.',
      pending_id: inserted[0].id,
    })
  }

  return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 })
}
