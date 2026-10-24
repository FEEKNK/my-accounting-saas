import { NextRequest, NextResponse } from 'next/server';
import { verifyTenantMembership, TenantAccessError } from '@/db/access';
import { getSessionUser } from '@/lib/auth/session';
import { getProductsFromDb, createProductInDb } from '@/db/queries';
import { getProducts, addProduct } from '@/lib/data-layer';
import { db } from '@/db/index';
import { CreateProductSchema } from '@/lib/validation/accounting-schemas';

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

    const data = await getProductsFromDb(companyId);
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

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validated = CreateProductSchema.parse(body);

    const created = await createProductInDb(companyId, validated);

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
