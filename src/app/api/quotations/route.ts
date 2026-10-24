import { NextRequest, NextResponse } from 'next/server';
import { CreateQuotationSchema } from '@/lib/validation/accounting-schemas';
import { getQuotations, createQuotation } from '@/lib/data-layer';
import { verifyTenantMembership, TenantAccessError } from '@/db/access';
import { getSessionUser } from '@/lib/auth/session';
import { getQuotationsFromDb, createQuotationInDb } from '@/db/queries';
import { db } from '@/db/index';

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

    const data = await getQuotationsFromDb(companyId);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    const status = err instanceof TenantAccessError ? 403 : 400;
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validated = CreateQuotationSchema.parse(body);

    const subtotalCents = validated.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceCents,
      0
    );
    const discountCents = validated.lineItems.reduce(
      (sum, item) => sum + item.discountCents,
      0
    );
    const netTaxable = Math.max(0, subtotalCents - discountCents);
    const vatCents = Math.round(netTaxable * 0.07);
    const totalCents = netTaxable + vatCents;

    const lineItems = validated.lineItems.map((li, idx) => ({
      ...li,
      id: `li_${idx}_${Date.now()}`,
    }));

    const quotationPayload = {
      contactId: validated.contactId,
      contactName: validated.contactName,
      contactTaxId: validated.contactTaxId,
      date: validated.date,
      validUntil: validated.validUntil,
      status: validated.status,
      subtotalCents,
      discountCents,
      vatCents,
      totalCents,
      notes: validated.notes,
      lineItems,
    };

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const created = await createQuotationInDb(companyId, quotationPayload);

    return NextResponse.json({ success: true, data: created }, { status: 201 });

  } catch (err: any) {
    if (err instanceof TenantAccessError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: err.message || 'Validation Failed' },
      { status: 422 }
    );
  }
}

