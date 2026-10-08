import {getTranslations} from 'next-intl/server';

export async function StoreFooter() {
  const t = await getTranslations('Store');

  return (
    <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
      {t('footer')}
    </footer>
  );
}
