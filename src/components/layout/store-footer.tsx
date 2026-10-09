import {getTranslations} from 'next-intl/server';

export async function StoreFooter() {
  const t = await getTranslations('Home');

  return (
    <footer className="bg-[var(--footer-bg)] text-[var(--footer-ink)]">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:px-10 lg:py-20">
        <div>
          <a href="#top" className="text-2xl font-extrabold tracking-[-0.06em] focus-visible:outline-2 focus-visible:outline-offset-4" dir="ltr">Mates Store.</a>
          <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-75">{t('footerTagline')}</p>
        </div>
        <div>
          <h2 className="text-sm font-bold">{t('footerExplore')}</h2>
          <nav className="mt-5 flex flex-col items-start gap-3 text-sm opacity-80" aria-label={t('footerExplore')}>
            <a href="#categories" className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">{t('footerCategories')}</a>
            <a href="#individual" className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">{t('footerIndividual')}</a>
            <a href="#bundle" className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">{t('footerBundles')}</a>
          </nav>
        </div>
        <div>
          <h2 className="text-sm font-bold">{t('footerContact')}</h2>
          <p className="mt-5 max-w-xs text-sm leading-relaxed opacity-75">{t('footerContactPending')}</p>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] border-t border-current/20 px-6 py-5 text-xs opacity-65 lg:px-10">
        © {t('footerCopyright')}
      </div>
    </footer>
  );
}
