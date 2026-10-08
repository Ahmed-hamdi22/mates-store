'use client';

import {useTranslations} from 'next-intl';

export default function ErrorPage({reset}: {error: Error; reset: () => void}) {
  const t = useTranslations('Errors');

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md border px-4 py-2 hover:bg-muted"
      >
        {t('retry')}
      </button>
    </main>
  );
}
