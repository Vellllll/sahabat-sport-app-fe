import { isAdminRole } from './roles';
import type { Permission, UserRole } from './types';

const ADMIN_PERMISSIONS: Permission[] = [
  'admin:access',
  'transactions:manage',
  'products:manage',
  'categories:manage',
];

export function getPermissionsForRole(role: UserRole | null | undefined): Permission[] {
  if (!isAdminRole(role)) return [];
  return [...ADMIN_PERMISSIONS];
}

export function hasPermission(
  role: UserRole | null | undefined,
  permission: Permission
): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function canAccessAdmin(role: UserRole | null | undefined): boolean {
  return isAdminRole(role);
}

export function getRequiredPermissionForPath(pathname: string): Permission | null {
  if (pathname.startsWith('/admin/products')) return 'products:manage';
  if (pathname.startsWith('/admin/categories')) return 'categories:manage';
  if (pathname.startsWith('/admin')) return 'admin:access';
  return null;
}
