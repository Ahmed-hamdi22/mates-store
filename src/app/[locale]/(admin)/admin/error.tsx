'use client';

import {useTranslations} from 'next-intl';

export default function AdminError({reset}: {error: Error; reset: () => void}) {
  const t = useTranslations('AdminDashboard');
  return (
    <div role="alert" className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
      <h1 className="text-xl font-bold">{t('errorTitle')}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t('errorDescription')}</p>
      <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">{t('retry')}</button>
    </div>
  );
}
