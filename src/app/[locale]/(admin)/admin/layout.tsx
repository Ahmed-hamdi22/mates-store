import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export default async function AdminLayout({children}: {children: React.ReactNode}) {
  const t = await getTranslations('Admin');

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <span className="font-semibold">{t('title')}</span>
          <Link href="/" className="text-sm underline-offset-4 hover:underline">
            {t('back')}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
