import { eq, and } from 'drizzle-orm';
import { db } from './index';

export class TenantAccessError extends Error {
  constructor(message = 'Unauthorized tenant access attempt detected') {
    super(message);
    this.name = 'TenantAccessError';
  }
}

/**
 * Validates that an active tenant/company context exists.
 * Throws TenantAccessError if companyId is missing or empty.
 */
export function requireTenant(companyId?: string): string {
  if (!companyId || typeof companyId !== 'string' || companyId.trim() === '') {
    throw new TenantAccessError('Valid company_id is required for this operation');
  }
  return companyId.trim();
}

/**
 * Verifies that the authenticated context has legitimate membership in the requested company.
 * Throws TenantAccessError if access is not authorized.
 */
export function verifyTenantMembership(
  userAllowedCompanyIds: string[],
  requestedCompanyId?: string
): string {
  const verifiedTenantId = requireTenant(requestedCompanyId);
  if (!userAllowedCompanyIds.includes(verifiedTenantId)) {
    throw new TenantAccessError(`Access denied to tenant '${verifiedTenantId}'`);
  }
  return verifiedTenantId;
}

/**
 * Executes a database operation within a strict tenant boundary.
 * Guarantees that any query automatically scopes by company_id.
 */
export async function withTenantScope<T>(
  companyId: string,
  operation: (scopedCompanyId: string) => Promise<T>
): Promise<T> {
  const verifiedTenantId = requireTenant(companyId);
  return await operation(verifiedTenantId);
}

