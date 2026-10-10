import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {ThemeSwitcher} from '@/components/common/theme-switcher';
import {AdminLoginForm} from '@/components/admin/login-form';
import {logoutAction} from '@/features/admin-auth/actions';
import {getAdminIdentity} from '@/features/admin-auth/authorization';
import {safeAdminReturnTo} from '@/features/admin-auth/return-to';
import {Link} from '@/i18n/navigation';

export const metadata: Metadata = {title: 'Admin sign in | Mates Store', robots: {index: false}};
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  params, searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{next?: string; logout?: string}>;
}) {
  const [{locale}, query, t, auth] = await Promise.all([
    params, searchParams, getTranslations('AdminAuth'), getAdminIdentity()
  ]);
  const next = safeAdminReturnTo(query.next, locale);
  if (auth.status === 'authorized' && query.logout !== 'failed') redirect(next);

  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Link href="/" className="text-xl font-extrabold tracking-tight">Mates Store</Link>
        <div className="flex items-center gap-2">
          <Link href="/admin/login" locale={otherLocale} className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
            {otherLocale === 'ar' ? 'العربية' : 'English'}
          </Link>
          <ThemeSwitcher />
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:py-20">
        <div className="max-w-xl">
          <p className="section-eyebrow">Mates Store / Admin</p>
          <h1 className="section-title">{t('welcome')}</h1>
          <p className="section-description">{t('intro')}</p>
          <div aria-hidden="true" className="mt-12 hidden h-48 rounded-3xl border border-border bg-[linear-gradient(135deg,var(--forest),var(--hero-surface))] lg:block" />
        </div>
        <section aria-labelledby="login-title" className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10 lg:justify-self-end">
          <h2 id="login-title" className="text-2xl font-bold tracking-tight">
            {auth.status === 'forbidden' ? t('accessDeniedTitle') : auth.status === 'authorized' ? t('logoutFailedTitle') : t('title')}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {auth.status === 'forbidden' ? t('accessDeniedDescription') : auth.status === 'authorized' ? t('logoutFailedDescription') : auth.status === 'unavailable' ? t('unavailable') : t('description')}
          </p>
          {auth.status === 'unauthenticated' && <AdminLoginForm locale={locale} next={next} />}
          {(auth.status === 'forbidden' || auth.status === 'authorized') && (
            <form action={logoutAction.bind(null, locale)} className="mt-8">
              <button type="submit" className="min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">{t('signOut')}</button>
            </form>
          )}
          <Link href="/" className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline">{t('backToStore')}</Link>
        </section>
      </div>
    </main>
  );
}
