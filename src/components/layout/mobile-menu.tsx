'use client';

import {Menu, Search, X} from 'lucide-react';
import {Dialog} from 'radix-ui';
import {LanguageSwitcher} from '@/components/common/language-switcher';
import {Link} from '@/i18n/navigation';

type MobileMenuProps = {
  locale: string;
  labels: {
    menu: string;
    close: string;
    women: string;
    men: string;
    couples: string;
    newIn: string;
    comingSoon: string;
    search: string;
  };
};

export function MobileMenu({locale, labels}: MobileMenuProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="inline-flex size-11 items-center justify-center rounded-md border border-border bg-card text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden" aria-label={labels.menu}>
        <Menu aria-hidden="true" className="size-5" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40" />
        <Dialog.Content className="fixed inset-y-0 end-0 z-50 flex w-[min(22rem,90vw)] flex-col border-s border-border bg-background p-6 text-foreground shadow-xl outline-none">
          <div className="flex items-center justify-between gap-4">
            <Dialog.Title className="text-lg font-extrabold tracking-tight" dir="ltr">Mates Store</Dialog.Title>
            <Dialog.Close className="inline-flex size-11 items-center justify-center rounded-md border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label={labels.close}>
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{labels.menu}</Dialog.Description>
          <Dialog.Close asChild>
            <Link href="/products" className="mt-8 flex min-h-11 items-center gap-3 rounded-md border border-border bg-muted/50 px-4 text-sm text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
              <Search aria-hidden="true" className="size-4 text-muted-foreground" />
              <span>{labels.search}</span>
            </Link>
          </Dialog.Close>
          <nav className="mt-8 flex flex-col border-t border-border" aria-label={labels.menu}>
            <Dialog.Close asChild>
              <Link href="/products?category=women" className="flex min-h-14 items-center justify-between border-b border-border text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">
                <span>{labels.women}</span>
              </Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link href="/products?category=men" className="flex min-h-14 items-center justify-between border-b border-border text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">
                <span>{labels.men}</span>
              </Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link href="/#couples" className="flex min-h-14 items-center justify-between border-b border-border font-semibold text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">
                <span>{labels.couples}</span>
              </Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link href="/products?sort=newest" className="flex min-h-14 items-center justify-between border-b border-border text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">
                <span>{labels.newIn}</span>
              </Link>
            </Dialog.Close>
          </nav>
          <div className="mt-auto border-t border-border pt-6">
            <LanguageSwitcher locale={locale} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
