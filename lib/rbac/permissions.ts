import type { Permission, UserRole } from './types';

const ADMIN_PERMISSIONS: Permission[] = [
  'admin:access',
  'transactions:manage',
  'products:manage',
  'categories:manage',
];

const EMPLOYEE_PERMISSIONS: Permission[] = [
  'admin:access',
  'transactions:manage',
];

export function getPermissionsForRole(role: UserRole | null | undefined): Permission[] {
  if (!role) return [];

  const permissions = new Set<Permission>();

  if (role.is_admin) {
    ADMIN_PERMISSIONS.forEach((permission) => permissions.add(permission));
  }

  if (role.is_employee) {
    EMPLOYEE_PERMISSIONS.forEach((permission) => permissions.add(permission));
  }

  return Array.from(permissions);
}

export function hasPermission(
  role: UserRole | null | undefined,
  permission: Permission
): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function canAccessAdmin(role: UserRole | null | undefined): boolean {
  return hasPermission(role, 'admin:access');
}

export function getRequiredPermissionForPath(pathname: string): Permission | null {
  if (pathname.startsWith('/admin/products')) return 'products:manage';
  if (pathname.startsWith('/admin/categories')) return 'categories:manage';
  if (pathname.startsWith('/admin')) return 'admin:access';
  return null;
}
