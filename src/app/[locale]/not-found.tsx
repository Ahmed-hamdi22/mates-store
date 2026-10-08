import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export default async function NotFoundPage() {
  const [errors, store] = await Promise.all([
    getTranslations('Errors'),
    getTranslations('Store')
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="text-2xl font-semibold">{errors('notFound')}</h1>
      <Link href="/" className="mt-6 inline-block underline underline-offset-4">
        {store('home')}
      </Link>
    </main>
  );
}
