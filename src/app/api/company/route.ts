import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { verifyTenantMembership, TenantAccessError } from '@/db/access';
import { db } from '@/db/index';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const companyId = request.headers.get('x-company-id') || user.companyId;
    verifyTenantMembership(user.allowedCompanyIds, companyId);

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const [comp] = await db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.id, companyId));

    if (!comp) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลกิจการที่ระบุ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: comp.id,
        name: comp.name,
        taxId: comp.taxId,
        branch: comp.branch,
        address: comp.address,
        phone: comp.phone || '',
        email: comp.email || '',
        logoUrl: comp.logoUrl || '',
      },
    });
  } catch (err: any) {
    const status = err instanceof TenantAccessError ? 403 : 500;
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const companyId = request.headers.get('x-company-id') || user.companyId;
    verifyTenantMembership(user.allowedCompanyIds, companyId);

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, taxId, branch, address, phone, email } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุชื่อกิจการหรือบริษัท' },
        { status: 422 }
      );
    }

    const [updated] = await db
      .update(schema.companies)
      .set({
        name: name.trim(),
        taxId: (taxId || '').trim(),
        branch: (branch || 'สำนักงานใหญ่').trim(),
        address: (address || '').trim(),
        phone: (phone || '').trim() || null,
        email: (email || '').trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.companies.id, companyId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลกิจการที่ต้องการแก้ไข' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        taxId: updated.taxId,
        branch: updated.branch,
        address: updated.address,
        phone: updated.phone || '',
        email: updated.email || '',
        logoUrl: updated.logoUrl || '',
      },
    });
  } catch (err: any) {
    const status = err instanceof TenantAccessError ? 403 : 400;
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status }
    );
  }
}
