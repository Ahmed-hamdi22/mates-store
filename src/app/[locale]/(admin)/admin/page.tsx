import {getTranslations} from 'next-intl/server';

export default async function AdminPage() {
  const t = await getTranslations('Admin');

  return (
    <div className="rounded-xl border bg-background p-8">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="mt-3 text-muted-foreground">{t('description')}</p>
    </div>
  );
}
