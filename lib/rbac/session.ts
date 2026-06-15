import { cookies } from 'next/headers';
import { isTokenExpired } from '@/lib/auth';
import { serverApiFetch } from '@/lib/server-api';
import { getRoleFromToken, getUserIdFromToken } from './jwt';
import type { Session, SessionUser } from './types';

function parseSessionUser(raw: unknown, fallbackUserId: number | null): SessionUser | null {
  if (!raw || typeof raw !== 'object') return null;

  const user = raw as Partial<SessionUser>;
  const id = typeof user.id === 'number' ? user.id : fallbackUserId;

  if (!id) return null;

  return {
    id,
    name: typeof user.name === 'string' ? user.name : 'User',
    email: user.email ?? null,
    phone_number: user.phone_number ?? null,
    role: user.role ?? null,
  };
}

async function fetchSessionUserFromApi(): Promise<SessionUser | null> {
  try {
    const response = await serverApiFetch<{ data?: { user?: SessionUser } }>('/auth', {
      revalidate: 0,
    });

    return response.data?.user ?? null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token || isTokenExpired(token)) {
    return null;
  }

  const userId = getUserIdFromToken(token);
  const roleFromToken = getRoleFromToken(token);
  const userDataRaw = cookieStore.get('user_data')?.value;

  let user = userDataRaw
    ? parseSessionUser(JSON.parse(userDataRaw), userId)
    : null;

  if (!user && userId) {
    user = {
      id: userId,
      name: 'User',
      role: roleFromToken,
    };
  }

  if (user && !user.role && roleFromToken) {
    user = { ...user, role: roleFromToken };
  }

  if (!user?.role) {
    const apiUser = await fetchSessionUserFromApi();
    if (apiUser) {
      user = apiUser;
    }
  }

  if (!user) {
    return null;
  }

  return { token, user };
}
