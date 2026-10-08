import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/proxy';

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Let next-intl generate the localized routing response first
  const response = handleI18nRouting(request);

  // Refresh Supabase session tokens onto the localized response
  return await updateSession(request, response);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};

