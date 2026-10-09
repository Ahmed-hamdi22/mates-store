import {Search} from 'lucide-react';
import {getLocale, getTranslations} from 'next-intl/server';
import {LanguageSwitcher} from '@/components/common/language-switcher';
import {ThemeSwitcher} from '@/components/common/theme-switcher';
import {MobileMenu} from '@/components/layout/mobile-menu';
import {Link} from '@/i18n/navigation';

export async function StoreHeader() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('Store')]);
  const labels = {
    menu: t('menu'), close: t('close'), women: t('women'), men: t('men'),
    couples: t('couples'), newIn: t('newIn'), comingSoon: t('comingSoon'), search: t('search')
  };

  return (
    <header className="relative z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="shrink-0 text-xl font-extrabold tracking-[-0.06em] text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" dir="ltr">
          Mates Store<span className="text-primary">.</span>
        </Link>
        <nav className="hidden items-center gap-5 text-[0.8rem] font-semibold lg:flex xl:gap-7" aria-label={t('navigation')}>
          <span className="cursor-not-allowed text-muted-foreground" title={t('comingSoon')}>{t('women')}</span>
          <span className="cursor-not-allowed text-muted-foreground" title={t('comingSoon')}>{t('men')}</span>
          <a href="#couples" className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">{t('couples')}</a>
          <span className="cursor-not-allowed text-muted-foreground" title={t('comingSoon')}>{t('newIn')}</span>
        </nav>
        <div className="hidden h-10 min-w-44 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground xl:flex" aria-disabled="true" title={t('comingSoon')}>
          <Search aria-hidden="true" className="size-4" />
          <span>{t('search')}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block"><LanguageSwitcher locale={locale} /></div>
          <ThemeSwitcher />
          <MobileMenu locale={locale} labels={labels} />
        </div>
      </div>
    </header>
  );
}
