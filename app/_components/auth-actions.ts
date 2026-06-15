// app/_components/auth-actions.ts
'use server';

import { cookies } from 'next/headers';

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('session_token');
    cookieStore.delete('user_data');
}