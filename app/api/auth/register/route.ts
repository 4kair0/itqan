import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { query, queryOne } from "@/lib/db"
import { signToken } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"

const REFERRAL_COOKIE = 'devin_lesson_referral'

async function attributeLessonReferral(userId: string) {
  try {
    const jar = await cookies()
    const referralId = jar.get(REFERRAL_COOKIE)?.value
    if (!referralId) return
    await query(
      `UPDATE public_lesson_signup_referrals
       SET converted_user_id = $1, converted_at = NOW()
       WHERE id = $2 AND converted_user_id IS NULL`,
      [userId, referralId]
    )
    await query(
      `UPDATE public_lessons SET signup_count = signup_count + 1
       WHERE id = (SELECT lesson_id FROM public_lesson_signup_referrals WHERE id = $1)`,
      [referralId]
    )
    jar.delete(REFERRAL_COOKIE)
  } catch (e) {
    console.error('[register] failed to attribute lesson referral:', e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, gender, platform_choice, register_role } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      )
    }

    if (gender && !['male', 'female'].includes(gender)) {
      return NextResponse.json({ error: "الجنس غير صحيح" }, { status: 400 })
    }

    // platform_choice validation (optional, default to both)
    const pChoice = ['both', 'quran', 'academy'].includes(platform_choice) ? platform_choice : 'both';

    // Role validation: only 'student' or 'parent' allowed via self-registration
    const userRole = register_role === 'parent' ? 'parent' : 'student';

    // Parents automatically get academy-only access
    const hasQuranAccess = userRole === 'parent' ? false : (pChoice === 'quran' || pChoice === 'both');
    const hasAcademyAccess = userRole === 'parent' ? true : (pChoice === 'academy' || pChoice === 'both');
    const finalPlatformPref = userRole === 'parent' ? 'academy' : pChoice;

    const existing = await queryOne<{ id: string; email_verified: boolean }>(
      "SELECT id, email_verified FROM users WHERE email = $1 LIMIT 1",
      [email.toLowerCase()]
    )

    const passwordHash = await bcrypt.hash(password, 10)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    let user;

    if (existing) {
      if (existing.email_verified) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مسجل ومفعل مسبقاً، يرجى تسجيل الدخول" },
          { status: 409 }
        )
      } else {
        return NextResponse.json(
          {
            error: "البريد الإلكتروني مسجل ولكنه غير مفعل.",
            requiresVerification: true
          },
          { status: 409 }
        )
      }
    } else {
      // Create new record — use try/catch to catch DB constraint errors
      try {
        const newUsers = await query<{ id: string; name: string; email: string; role: string }>(
          `INSERT INTO users (name, email, password_hash, role, gender, platform_choice, has_quran_access, has_academy_access, platform_preference, verification_code, verification_expires_at, email_verified)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, FALSE)
           RETURNING id, name, email, role`,
          [name, email.toLowerCase(), passwordHash, userRole, gender || null, pChoice, hasQuranAccess, hasAcademyAccess, finalPlatformPref, verificationCode, expiresAt.toISOString()]
        )
        user = newUsers[0]
        
        if (!user) {
          console.error("Register INSERT returned empty - params:", { userRole, pChoice, hasQuranAccess, hasAcademyAccess, finalPlatformPref })
          return NextResponse.json({ error: "فشل إنشاء الحساب، يرجى المحاولة لاحقاً" }, { status: 500 })
        }
      } catch (insertError) {
        console.error("Register INSERT error:", insertError)
        return NextResponse.json({ error: "فشل إنشاء الحساب في قاعدة البيانات" }, { status: 500 })
      }
    }

    // Send verification email
    if (user) {
      await sendVerificationEmail(user.email, user.name, verificationCode)
      // Attribute the signup back to the public lesson, if any.
      await attributeLessonReferral(user.id)
    } else {
       throw new Error("فشل إنشاء سجل المستخدم")
    }

    return NextResponse.json({
      user,
      requiresVerification: true,
      message: "تم إنشاء الحساب، يرجى تفعيل بريدك الإلكتروني"
    }, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
