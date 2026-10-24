import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db/index';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/password';
import { createSessionToken } from '@/lib/auth/token';
import { checkRateLimit } from '@/lib/security/rate-limiter';

const RegisterSchema = z.object({
  companyName: z.string().min(1, 'กรุณาระบุชื่อบริษัท หรือชื่อกิจการ'),
  taxId: z.string().optional().default(''),
  name: z.string().min(1, 'กรุณาระบุชื่อ-นามสกุลของคุณ'),
  email: z.string().email('กรุณาระบุรูปแบบอีเมลให้ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'),
});

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Rate limiting: 3 registrations per 10 minutes per IP
    const rateCheck = checkRateLimit(`register:${ip}`, 3, 600);
    if (!rateCheck.allowed) {
      const waitMinutes = Math.ceil(rateCheck.resetSeconds / 60);
      return NextResponse.json(
        {
          success: false,
          error: `มีการลงทะเบียนบ่อยเกินไป กรุณารอ ${waitMinutes} นาทีแล้วลองใหม่อีกครั้ง`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.resetSeconds) },
        }
      );
    }

    const body = await request.json();
    const validated = RegisterSchema.parse(body);
    const email = validated.email.trim().toLowerCase();

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    // Check if user with this email already exists
    const [existing] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'อีเมลนี้ถูกใช้งานแล้วในระบบ กรุณาเข้าสู่ระบบ' },
        { status: 409 }
      );
    }

    const companyId = `comp_${Date.now()}`;
    const userId = `usr_${Date.now()}`;
    const passwordHash = await hashPassword(validated.password);

    // 1. Create company
    const [newCompany] = await db
      .insert(schema.companies)
      .values({
        id: companyId,
        name: validated.companyName.trim(),
        taxId: (validated.taxId || '').trim(),
        branch: 'สำนักงานใหญ่',
        address: '-',
        phone: '',
        email: email,
        currency: 'THB',
        plan: 'pro',
      })
      .returning();

    // 2. Create user (owner role)
    const [newUser] = await db
      .insert(schema.users)
      .values({
        id: userId,
        companyId: companyId,
        email: email,
        name: validated.name.trim(),
        role: 'owner',
        status: 'active',
        passwordHash: passwordHash,
      })
      .returning();

    // 3. Generate signed session token
    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      companyId: newUser.companyId,
      role: newUser.role,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            companyId: newUser.companyId,
          },
          company: {
            id: newCompany.id,
            name: newCompany.name,
            taxId: newCompany.taxId,
          },
        },
      },
      { status: 201 }
    );

    response.cookies.set('my_accounting_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set('kanta_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
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
      { success: false, error: err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' },
      { status: 500 }
    );
  }
}
