import {getTranslations, setRequestLocale} from 'next-intl/server';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Store');

  return (
    <section className="mx-auto flex min-h-[65vh] max-w-5xl flex-col justify-center px-6 py-20 sm:px-10">
      <div className="max-w-2xl space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t('home')}
        </p>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">{t('name')}</h1>
        <p className="text-xl leading-relaxed text-muted-foreground sm:text-2xl">
          {t('intro')}
        </p>
        <p className="text-sm text-muted-foreground">{t('setup')}</p>
      </div>
    </section>
  );
}
