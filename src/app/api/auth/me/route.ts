import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { db } from '@/db/index';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: ไม่พบเซสชันการเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    let company = null;
    let userDetails = null;

    if (db) {
      const [u] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id));

      if (u) {
        userDetails = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatarUrl: u.avatarUrl,
        };
      }

      const [c] = await db
        .select()
        .from(schema.companies)
        .where(eq(schema.companies.id, user.companyId));

      if (c) {
        company = {
          id: c.id,
          name: c.name,
          taxId: c.taxId,
          branch: c.branch,
          address: c.address,
          phone: c.phone,
          email: c.email,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userDetails || {
          id: user.id,
          name: 'ผู้ดูแลระบบ My Accounting',
          email: user.email,
          role: user.role,
        },
        company: company || {
          id: user.companyId,
          name: 'กิจการของฉัน',
          taxId: '',
          branch: 'สำนักงานใหญ่',
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
