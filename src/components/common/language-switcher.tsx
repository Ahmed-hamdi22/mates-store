'use client';

import {Link, usePathname} from '@/i18n/navigation';

export function LanguageSwitcher({locale}: {locale: string}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Language" className="flex items-center gap-1 text-sm">
      <Link
        href={pathname}
        locale="en"
        aria-current={locale === 'en' ? 'page' : undefined}
        className="rounded-md px-2 py-1 hover:bg-muted aria-[current=page]:font-semibold"
      >
        English
      </Link>
      <span aria-hidden="true" className="text-muted-foreground">/</span>
      <Link
        href={pathname}
        locale="ar"
        aria-current={locale === 'ar' ? 'page' : undefined}
        className="rounded-md px-2 py-1 hover:bg-muted aria-[current=page]:font-semibold"
      >
        العربية
      </Link>
    </nav>
  );
}

