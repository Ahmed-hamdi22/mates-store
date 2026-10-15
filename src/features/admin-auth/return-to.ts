import {routing} from '@/i18n/routing';

/** Accept only a same-locale admin destination, never a login page or external URL. */
export function safeAdminReturnTo(value: unknown, locale: string): string {
  const fallback = `/${locale}/admin`;
  if (!routing.locales.includes(locale as 'en' | 'ar') || typeof value !== 'string') return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || /[\\\x00-\x1f]|%(?:2f|5c|00)/i.test(value)) return fallback;

  try {
    const url = new URL(value, 'https://mates-store.invalid');
    const base = `/${locale}/admin`;
    if (url.origin !== 'https://mates-store.invalid') return fallback;
    if (url.pathname !== base && !url.pathname.startsWith(`${base}/`)) return fallback;
    if (url.pathname === `${base}/login` || url.pathname.startsWith(`${base}/login/`)) return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}
