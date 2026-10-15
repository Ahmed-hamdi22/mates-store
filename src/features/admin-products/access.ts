import 'server-only';

import {getLocale} from 'next-intl/server';
import {requireAdmin} from '@/features/admin-auth/authorization';
import {createClient} from '@/lib/supabase/server';

/** Authenticate each product read or mutation before creating its request-scoped client. */
export async function getProductAdminClient() {
  await requireAdmin(await getLocale());
  const supabase = await createClient();
  return supabase;
}
