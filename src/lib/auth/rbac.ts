export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export type Action = 'read' | 'create' | 'update' | 'approve' | 'delete';
export type Resource = 'document' | 'contact' | 'product' | 'settings' | 'team' | 'tax';

export interface UserContext {
  id: string;
  companyId: string;
  email: string;
  role: Role;
}

const rolePermissions: Record<Role, Record<Resource, Action[]>> = {
  owner: {
    document: ['read', 'create', 'update', 'approve', 'delete'],
    contact: ['read', 'create', 'update', 'approve', 'delete'],
    product: ['read', 'create', 'update', 'approve', 'delete'],
    settings: ['read', 'create', 'update', 'approve', 'delete'],
    team: ['read', 'create', 'update', 'approve', 'delete'],
    tax: ['read', 'create', 'update', 'approve', 'delete'],
  },
  admin: {
    document: ['read', 'create', 'update', 'approve', 'delete'],
    contact: ['read', 'create', 'update', 'approve', 'delete'],
    product: ['read', 'create', 'update', 'approve', 'delete'],
    settings: ['read', 'update'],
    team: ['read', 'create', 'update'],
    tax: ['read', 'create', 'update', 'approve'],
  },
  editor: {
    document: ['read', 'create', 'update'],
    contact: ['read', 'create', 'update'],
    product: ['read', 'create', 'update'],
    settings: ['read'],
    team: ['read'],
    tax: ['read'],
  },
  viewer: {
    document: ['read'],
    contact: ['read'],
    product: ['read'],
    settings: ['read'],
    team: ['read'],
    tax: ['read'],
  },
};

/**
 * Universal Authorization Check
 * Answers: Can this user perform this action on this resource?
 */
export function canUser(
  user: UserContext | null | undefined,
  action: Action,
  resource: Resource
): boolean {
  if (!user || !user.role) return false;
  const allowedActions = rolePermissions[user.role]?.[resource] || [];
  return allowedActions.includes(action);
}

/**
 * Ensures user belongs to the requested company/tenant.
 */
export function isUserInCompany(
  user: UserContext | null | undefined,
  targetCompanyId: string
): boolean {
  if (!user || !user.companyId) return false;
  return user.companyId === targetCompanyId;
}
