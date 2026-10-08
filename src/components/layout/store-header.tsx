import {getLocale, getTranslations} from 'next-intl/server';
import {LanguageSwitcher} from '@/components/common/language-switcher';
import {Link} from '@/i18n/navigation';

export async function StoreHeader() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('Store')]);

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {t('name')}
        </Link>
        <LanguageSwitcher locale={locale} />
      </div>
    </header>
  );
}
