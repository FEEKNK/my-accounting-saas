import { NextRequest, NextResponse } from 'next/server';
import { verifyTenantMembership, TenantAccessError } from '@/db/access';
import { getSessionUser } from '@/lib/auth/session';
import { recordPaymentInDb } from '@/db/queries';
import { recordInvoicePayment, getInvoiceById } from '@/lib/data-layer';
import { db } from '@/db/index';
import { RecordPaymentSchema } from '@/lib/validation/accounting-schemas';

export async function POST(
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

    const { id } = await params;
    const body = await request.json();
    const validated = RecordPaymentSchema.parse({
      ...body,
      invoiceId: id,
    });

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const result = await recordPaymentInDb(
      companyId,
      id,
      validated.paymentAmountCents,
      validated.paymentMethod
    );

    return NextResponse.json({
      success: true,
      data: {
        receipt: result.receipt,
        invoice: result.invoice,
      },
    });
  } catch (err: any) {
    if (err instanceof TenantAccessError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: err.message || 'บันทึกการชำระเงินไม่สำเร็จ' },
      { status: 400 }
    );
  }
}
