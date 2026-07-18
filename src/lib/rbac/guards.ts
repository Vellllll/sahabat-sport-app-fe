import { redirect } from 'next/navigation';
import { hasPermission } from './permissions';
import { isAdminRole } from './roles';
import { getSession } from './session';
import type { Permission, Session } from './types';

export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();

  if (!isAdminRole(session.user.role)) {
    redirect('/?error=unauthorized');
  }

  return session;
}

export async function requirePermission(permission: Permission): Promise<Session> {
  const session = await requireAdmin();

  if (!hasPermission(session.user.role, permission)) {
    redirect('/?error=unauthorized');
  }

  return session;
}

export async function ensurePermission(
  permission: Permission
): Promise<{ ok: true; session: Session } | { ok: false; error: string }> {
  const session = await getSession();

  if (!session) {
    return { ok: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' };
  }

  if (!isAdminRole(session.user.role)) {
    return { ok: false, error: 'Anda tidak memiliki izin untuk mengakses area admin.' };
  }

  if (!hasPermission(session.user.role, permission)) {
    return { ok: false, error: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };
  }

  return { ok: true, session };
}

export async function getOptionalSession() {
  return getSession();
}
