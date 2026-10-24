import { NextRequest, NextResponse } from 'next/server';
import { verifyTenantMembership, TenantAccessError } from '@/db/access';
import { getSessionUser } from '@/lib/auth/session';
import { getReceiptByIdFromDb } from '@/db/queries';
import { getReceiptById } from '@/lib/data-layer';
import { db } from '@/db/index';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const data = await getReceiptByIdFromDb(companyId, id);

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบเอกสารใบเสร็จรับเงิน' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    const status = err instanceof TenantAccessError ? 403 : 400;
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status }
    );
  }
}
