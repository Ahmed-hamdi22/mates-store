import 'server-only';

import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {safeAdminReturnTo} from './return-to';

export type AdminIdentity = {id: string; email: string};
export type AdminAuthResult =
  | {status: 'authorized'; admin: AdminIdentity}
  | {status: 'unauthenticated' | 'forbidden' | 'unavailable'};

/** Verify the current request's Supabase user and the database's own admin rule. */
export async function getAdminIdentity(): Promise<AdminAuthResult> {
  try {
    const supabase = await createClient();
    const {data: {user}, error: userError} = await supabase.auth.getUser();
    if (userError || !user) return {status: 'unauthenticated'};

    // This SECURITY DEFINER function checks auth.uid() against admin_users.
    // The browser cannot select or write arbitrary membership records.
    const {data: isAdmin, error: authorizationError} = await supabase.rpc('is_admin');
    if (authorizationError || typeof isAdmin !== 'boolean') return {status: 'unavailable'};
    if (!isAdmin) return {status: 'forbidden'};

    return {status: 'authorized', admin: {id: user.id, email: user.email ?? ''}};
  } catch {
    // Missing configuration or a failed auth/database request must fail closed.
    return {status: 'unavailable'};
  }
}

/** Call again inside each privileged Server Action and route, even under the layout. */
export async function requireAdmin(locale: string, returnTo?: string): Promise<AdminIdentity> {
  const result = await getAdminIdentity();
  if (result.status === 'authorized') return result.admin;

  const login = `/${locale}/admin/login`;
  if (result.status === 'unavailable') throw new Error('Admin authorization is unavailable');
  if (result.status === 'forbidden') redirect(`${login}?error=forbidden`);

  const destination = safeAdminReturnTo(returnTo, locale);
  redirect(`${login}?next=${encodeURIComponent(destination)}`);
}
