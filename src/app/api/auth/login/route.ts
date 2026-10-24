import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db/index';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionToken } from '@/lib/auth/token';
import { checkRateLimit, resetRateLimit } from '@/lib/security/rate-limiter';

const LoginSchema = z.object({
  email: z.string().email('กรุณาระบุรูปแบบอีเมลให้ถูกต้อง'),
  password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
});

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const body = await request.json();
    const validated = LoginSchema.parse(body);
    const email = validated.email.trim().toLowerCase();
    const password = validated.password;

    // Rate limiting: 5 attempts per 15 minutes per IP + email
    const rateCheck = checkRateLimit(`login:${ip}:${email}`, 5, 900);
    if (!rateCheck.allowed) {
      const waitMinutes = Math.ceil(rateCheck.resetSeconds / 60);
      return NextResponse.json(
        {
          success: false,
          error: `คุณพยายามเข้าสู่ระบบมากเกินไป กรุณารอ ${waitMinutes} นาทีแล้วลองใหม่อีกครั้ง`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.resetSeconds) },
        }
      );
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (!user || user.status !== 'active' || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // Reset rate limiter on successful authentication
    resetRateLimit(`login:${ip}:${email}`);

    // Generate signed session token (valid for 7 days)
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        },
      },
    });

    response.cookies.set('my_accounting_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    response.cookies.set('kanta_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.issues?.[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { success: false, error: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}
