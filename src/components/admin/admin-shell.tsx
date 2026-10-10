'use client';

import {useState} from 'react';
import {LayoutDashboard, Menu, Package, X} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {Dialog} from 'radix-ui';
import {ThemeSwitcher} from '@/components/common/theme-switcher';
import {logoutAction} from '@/features/admin-auth/actions';
import {Link, usePathname} from '@/i18n/navigation';

function AdminNavigation({onNavigate}: {onNavigate?: () => void}) {
  const t = useTranslations('AdminDashboard');
  const pathname = usePathname();
  const links = [
    {href: '/admin' as const, label: t('dashboard'), Icon: LayoutDashboard},
    {href: '/admin/products' as const, label: t('products'), Icon: Package}
  ];

  return (
    <nav aria-label={t('navigation')} className="space-y-1">
      {links.map(({href, label, Icon}) => {
        const active = pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));
        return (
          <Link key={href} href={href} onClick={onNavigate} aria-current={active ? 'page' : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/70'}`}>
            <Icon aria-hidden="true" className="size-4" />{label}
          </Link>
        );
      })}
      <div className="px-4 pb-2 pt-7 text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('comingLater')}</div>
      {[t('categories'), t('bundles'), t('settings')].map((label) => (
        <span key={label} aria-disabled="true" className="flex min-h-10 items-center justify-between gap-2 px-4 text-sm text-muted-foreground">
          {label}<span className="text-xs">{t('soon')}</span>
        </span>
      ))}
    </nav>
  );
}

export function AdminShell({children, email}: {children: React.ReactNode; email: string}) {
  const t = useTranslations('AdminDashboard');
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const otherLocale = locale === 'ar' ? 'en' : 'ar';

  const controls = (
    <div className="flex items-center gap-2">
      <Link href={pathname} locale={otherLocale} className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
        {otherLocale === 'ar' ? 'العربية' : 'English'}
      </Link>
      <ThemeSwitcher />
    </div>
  );

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden border-e border-sidebar-border bg-sidebar px-5 py-7 lg:flex lg:min-h-screen lg:flex-col">
        <Link href="/admin" className="px-3 text-xl font-extrabold tracking-tight text-sidebar-foreground">Mates Store</Link>
        <span className="mt-1 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('workspace')}</span>
        <div className="mt-10 flex-1"><AdminNavigation /></div>
        <div className="border-t border-sidebar-border pt-5">
          <p className="truncate px-3 text-xs text-muted-foreground" title={email}>{email}</p>
          <form action={logoutAction.bind(null, locale)}>
            <button type="submit" className="mt-3 min-h-11 w-full rounded-xl px-3 text-start text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-ring">{t('signOut')}</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-border bg-card px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <Dialog.Trigger asChild>
                <button type="button" aria-label={t('openMenu')} className="inline-flex size-11 items-center justify-center rounded-lg border border-border hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring lg:hidden">
                  <Menu aria-hidden="true" className="size-5" />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55" />
                <Dialog.Content className="fixed inset-y-0 start-0 z-50 flex w-[min(88vw,320px)] flex-col border-e border-sidebar-border bg-sidebar p-6 shadow-2xl focus:outline-none">
                  <div className="flex items-center justify-between gap-3">
                    <Dialog.Title className="text-lg font-extrabold">Mates Store</Dialog.Title>
                    <Dialog.Close aria-label={t('closeMenu')} className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-ring"><X aria-hidden="true" className="size-5" /></Dialog.Close>
                  </div>
                  <Dialog.Description className="mt-1 text-xs text-muted-foreground">{t('workspace')}</Dialog.Description>
                  <div className="mt-8 flex-1"><AdminNavigation onNavigate={() => setMenuOpen(false)} /></div>
                  <p className="truncate text-xs text-muted-foreground" title={email}>{email}</p>
                  <form action={logoutAction.bind(null, locale)}>
                    <button type="submit" className="mt-3 min-h-11 w-full rounded-xl border border-sidebar-border text-sm font-semibold hover:bg-sidebar-accent">{t('signOut')}</button>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('workspace')}</p>
              <p className="font-bold text-foreground lg:hidden">Mates Store</p>
            </div>
          </div>
          {controls}
        </header>
        <main id="admin-main" className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12">{children}</main>
      </div>
    </div>
  );
}
