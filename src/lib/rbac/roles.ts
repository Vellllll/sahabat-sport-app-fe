import type { UserRole } from './types';

export function parseRole(value: unknown): UserRole | null {
  if (!value) return null;

  if (typeof value === 'string') {
    if (value.toUpperCase() === 'ADMIN') {
      return {
        id: 1,
        name: 'ADMIN',
        is_admin: true,
        is_employee: false,
        is_customer: false,
      };
    }
    return null;
  }

  if (typeof value === 'object') {
    const role = value as Partial<UserRole>;
    if (typeof role.id === 'number' && typeof role.name === 'string') {
      return {
        id: role.id,
        name: role.name,
        is_admin: Boolean(role.is_admin),
        is_employee: Boolean(role.is_employee),
        is_customer: Boolean(role.is_customer),
      };
    }
  }

  return null;
}

export function isAdminRole(role: UserRole | string | null | undefined): boolean {
  if (!role) return false;

  if (typeof role === 'string') {
    return role.toUpperCase() === 'ADMIN';
  }

  return role.name.toUpperCase() === 'ADMIN' || role.id === 1;
}

export function parseRoleFromUserData(raw: unknown): UserRole | null {
  if (!raw || typeof raw !== 'object') return null;

  const user = raw as { role?: unknown; role_id?: number };
  const roleFromField = parseRole(user.role);

  if (roleFromField) return roleFromField;
  if (user.role_id === 1) {
    return {
      id: 1,
      name: 'ADMIN',
      is_admin: true,
      is_employee: false,
      is_customer: false,
    };
  }

  return null;
}
