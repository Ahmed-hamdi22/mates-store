import Image from 'next/image';
import {ArrowUpRight, ImageIcon} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {HeroSlider, type HeroSlide} from '@/components/storefront/hero-slider';
import {getHomepageData, type HomepageData} from '@/features/storefront/get-homepage-data';

function CollectionMessage({status, message}: {status: HomepageData['status']; message: string}) {
  return (
    <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-border bg-card/60 px-6 text-center text-sm leading-relaxed text-muted-foreground" role={status === 'unavailable' ? 'status' : undefined}>
      {message}
    </div>
  );
}

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const [t, data] = await Promise.all([getTranslations('Home'), getHomepageData()]);
  const isArabic = locale === 'ar';
  const emptyMessage = data.status === 'unavailable'
    ? t('catalogUnavailable')
    : data.status === 'unconfigured'
      ? t('catalogUnconfigured')
      : t('catalogEmpty');
  const slides: HeroSlide[] = [
    {title: t('hero1Title'), description: t('hero1Description'), cta: t('hero1Cta'), href: '#couples', tone: 'soft'},
    {title: t('hero2Title'), description: t('hero2Description'), cta: t('hero2Cta'), href: '#individual', tone: 'forest'},
    {title: t('hero3Title'), description: t('hero3Description'), cta: t('hero3Cta'), href: '#bundle', tone: 'sage'}
  ];

  return (
    <div id="top" className="pb-20 sm:pb-28">
      <HeroSlider
        slides={slides}
        locale={locale}
        previousLabel={t('previousSlide')}
        nextLabel={t('nextSlide')}
        carouselLabel={t('carousel')}
        slidesLabel={t('slides')}
        slideLabels={slides.map((_, index) => t('goToSlide', {number: index + 1}))}
        imagePendingLabel={t('imagePending')}
      />

      <section id="categories" className="mx-auto max-w-[1440px] scroll-mt-24 px-4 pt-20 sm:px-6 sm:pt-28 lg:px-10">
        <div className="mb-8 max-w-xl">
          <p className="section-eyebrow">{t('categoriesEyebrow')}</p>
          <h2 className="section-title">{t('categoriesTitle')}</h2>
          <p className="section-description">{t('categoriesDescription')}</p>
        </div>
        {data.categories.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.categories.map((category, index) => (
              <div key={category.id} className="group flex min-h-40 flex-col justify-between rounded-xl border border-border bg-card p-6 sm:min-h-48">
                <span className="text-xs font-semibold text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">{isArabic ? category.name_ar : category.name_en}</h3>
              </div>
            ))}
          </div>
        ) : <CollectionMessage status={data.status} message={emptyMessage} />}
      </section>

      <section id="couples" className="mx-auto grid max-w-[1440px] scroll-mt-24 items-center gap-8 px-4 pt-20 sm:px-6 sm:pt-28 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <div className="order-2 lg:order-1">
          <p className="section-eyebrow">{t('couplesEyebrow')}</p>
          <h2 className="section-title max-w-[13ch]">{t('couplesTitle')}</h2>
          <p className="section-description max-w-md">{t('couplesDescription')}</p>
          <a href="#bundle" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            {t('couplesCta')}<ArrowUpRight aria-hidden="true" className="size-4 rtl:-rotate-90" />
          </a>
        </div>
        <div className="order-1 flex min-h-80 items-center justify-center rounded-2xl border border-border bg-secondary px-6 py-12 text-center text-sm text-muted-foreground sm:min-h-[420px] lg:order-2">
          <div className="flex flex-col items-center gap-4"><ImageIcon aria-hidden="true" className="size-8" /><span>{t('imagePending')}</span></div>
        </div>
      </section>

      <section id="individual" className="mx-auto max-w-[1440px] scroll-mt-24 px-4 pt-20 sm:px-6 sm:pt-28 lg:px-10">
        <div className="mb-8 max-w-2xl">
          <p className="section-eyebrow">{t('individualEyebrow')}</p>
          <h2 className="section-title">{t('individualTitle')}</h2>
          <p className="section-description">{t('individualDescription')}</p>
        </div>
        {data.products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {data.products.map((product) => (
              <article key={product.id} className="min-w-0">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-muted">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={isArabic ? product.title_ar : product.title_en} fill sizes="(max-width: 639px) 48vw, (max-width: 1023px) 46vw, 24vw" className="object-cover" />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-3 px-4 text-center text-xs text-muted-foreground"><ImageIcon aria-hidden="true" className="size-6" />{t('productImagePending')}</div>
                  )}
                </div>
                <h3 className="mt-3 truncate text-sm font-semibold sm:text-base">{isArabic ? product.title_ar : product.title_en}</h3>
              </article>
            ))}
          </div>
        ) : <CollectionMessage status={data.status} message={emptyMessage} />}
      </section>

      <section id="bundle" className="mx-auto max-w-[1440px] scroll-mt-24 px-4 pt-20 sm:px-6 sm:pt-28 lg:px-10">
        <div className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <p className="section-eyebrow">{t('bundleEyebrow')}</p>
            <h2 className="section-title">{t('bundleTitle')}</h2>
            <p className="section-description max-w-md">{t('bundleDescription')}</p>
            {data.bundles.length ? (
              <div className="mt-8 border-s-2 border-primary ps-4 text-lg font-semibold">
                {isArabic ? data.bundles[0].title_ar : data.bundles[0].title_en}
              </div>
            ) : <p className="mt-8 text-sm text-muted-foreground">{emptyMessage}</p>}
          </div>
          <div className="relative flex min-h-72 items-center justify-center bg-secondary p-8 sm:min-h-[420px]">
            {data.bundles[0]?.imageUrl ? (
              <Image src={data.bundles[0].imageUrl} alt={isArabic ? data.bundles[0].title_ar : data.bundles[0].title_en} fill sizes="(max-width: 1023px) 100vw, 55vw" className="object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground"><ImageIcon aria-hidden="true" className="size-8" />{t('bundleImagePending')}</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
