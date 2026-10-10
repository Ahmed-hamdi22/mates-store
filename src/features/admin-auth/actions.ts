'use server';

import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {routing} from '@/i18n/routing';
import {safeAdminReturnTo} from './return-to';

export type LoginState = {error: 'invalid' | 'denied' | 'unavailable' | null};

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const locale = formData.get('locale');
  if (locale !== 'en' && locale !== 'ar') return {error: 'invalid'};

  const email = formData.get('email');
  const password = formData.get('password');
  if (
    typeof email !== 'string' || email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== 'string' || password.length < 1 || password.length > 1024
  ) return {error: 'invalid'};

  const destination = safeAdminReturnTo(formData.get('next'), locale);
  let supabase;
  try {
    supabase = await createClient();
    const {error} = await supabase.auth.signInWithPassword({email: email.trim(), password});
    if (error) return {error: 'invalid'};

    // Re-verify identity on the server; a successful password is insufficient.
    const {data: {user}, error: userError} = await supabase.auth.getUser();
    if (userError || !user) {
      await supabase.auth.signOut();
      return {error: 'unavailable'};
    }

    const {data: isAdmin, error: authorizationError} = await supabase.rpc('is_admin');
    if (authorizationError || typeof isAdmin !== 'boolean') {
      await supabase.auth.signOut();
      return {error: 'unavailable'};
    }
    if (!isAdmin) {
      await supabase.auth.signOut();
      return {error: 'denied'};
    }
  } catch {
    if (supabase) await supabase.auth.signOut().catch(() => undefined);
    return {error: 'unavailable'};
  }

  redirect(destination);
}

export async function logoutAction(locale: string) {
  const safeLocale = routing.locales.includes(locale as 'en' | 'ar') ? locale : 'en';
  let signedOut = false;
  try {
    const supabase = await createClient();
    const {error} = await supabase.auth.signOut();
    signedOut = !error;
  } catch {
    // Keep the user informed instead of redirecting an active session in a loop.
  }
  if (!signedOut) redirect(`/${safeLocale}/admin/login?logout=failed`);
  redirect(`/${safeLocale}/admin/login`);
}
