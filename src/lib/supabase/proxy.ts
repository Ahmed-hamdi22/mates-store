import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

/**
 * Refreshes Supabase session tokens at the request/response network boundary.
 * Attaches refreshed auth cookies directly to the outgoing localized response,
 * ensuring session continuity without interfering with next-intl routing.
 */
export async function updateSession(
  request: NextRequest,
  response?: NextResponse
): Promise<NextResponse> {
  const res = response ?? NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        });
      },
    },
  });

  // Calling getUser refreshes the session token if expired.
  // Note: Do not call getSession() here as getUser() securely validates the auth token.
  await supabase.auth.getUser();

  return res;
}
