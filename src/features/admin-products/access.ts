import 'server-only';

import {createClient} from '@/lib/supabase/server';

/** Temporary standalone-branch guard. Replace with requireAdmin after auth merge. */
export async function getProductAdminClient() {
  const supabase = await createClient();
  const {data: {user}, error: userError} = await supabase.auth.getUser();
  if (userError || !user) return null;

  const {data: isAdmin, error: adminError} = await supabase.rpc('is_admin');
  if (adminError || isAdmin !== true) return null;
  return supabase;
}
