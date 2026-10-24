import { NextRequest } from 'next/server';
import { verifySessionToken } from './token';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  companyId: string;
  allowedCompanyIds: string[];
}

/**
 * Extracts and verifies the current session user from request cookies or headers.
 * Fail-Closed: returns null if no valid credentials or session found.
 */
export async function getSessionUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const sessionCookie =
    request.cookies.get('my_accounting_session')?.value ||
    request.cookies.get('kanta_session')?.value ||
    request.cookies.get('authjs.session-token')?.value;

  if (sessionCookie) {
    const payload = await verifySessionToken(sessionCookie);
    if (payload) {
      return {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        companyId: payload.companyId,
        allowedCompanyIds: [payload.companyId],
      };
    }
  }

  // Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const payload = await verifySessionToken(token);
    if (payload) {
      return {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        companyId: payload.companyId,
        allowedCompanyIds: [payload.companyId],
      };
    }
  }

  return null;
}
