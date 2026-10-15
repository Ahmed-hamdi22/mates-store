import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {requireAdmin} from '@/features/admin-auth/authorization';
import {Link} from '@/i18n/navigation';

export const metadata: Metadata = {title: 'Dashboard | Mates Store', robots: {index: false}};
export const dynamic = 'force-dynamic';

export default async function AdminPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const [admin, t] = await Promise.all([requireAdmin(locale), getTranslations('AdminDashboard')]);

  return (
    <div className="space-y-9">
      <div className="max-w-2xl">
        <p className="section-eyebrow">Mates Store / {t('workspace')}</p>
        <h1 className="section-title">{t('title')}</h1>
        <p className="section-description">{t('welcome', {email: admin.email || t('administrator')})}</p>
      </div>
      <section className="rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10" aria-labelledby="getting-started">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">{t('workspaceReady')}</p>
          <h2 id="getting-started" className="text-2xl font-bold tracking-tight">{t('emptyTitle')}</h2>
          <p className="mt-3 leading-7 text-muted-foreground">{t('emptyDescription')}</p>
          <Link href="/admin/products" className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring">
            {t('products')}
          </Link>
        </div>
      </section>
    </div>
  );
}
