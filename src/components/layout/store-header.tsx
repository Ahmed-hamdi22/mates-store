import {getLocale, getTranslations} from 'next-intl/server';
import {LanguageSwitcher} from '@/components/common/language-switcher';
import {ThemeSwitcher} from '@/components/common/theme-switcher';
import {Link} from '@/i18n/navigation';

export async function StoreHeader() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('Store')]);

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {t('name')}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
