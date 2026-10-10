'use client';

import {PackageSearch, ShoppingBag, RotateCcw} from 'lucide-react';
import {useRouter, usePathname, Link} from '@/i18n/navigation';

interface CatalogEmptyStateProps {
  hasFilters: boolean;
  labels: {
    noProductsTitle: string;
    noProductsDescription: string;
    clearFilters: string;
    emptyCollectionTitle: string;
    emptyCollectionDescription: string;
    returnHome: string;
  };
}

export function CatalogEmptyState({hasFilters, labels}: CatalogEmptyStateProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClearFilters = () => {
    router.push(pathname);
  };

  if (hasFilters) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center sm:p-12">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <PackageSearch className="size-7 stroke-[1.5]" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-foreground">
          {labels.noProductsTitle}
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {labels.noProductsDescription}
        </p>
        <button
          type="button"
          onClick={handleClearFilters}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <RotateCcw className="size-3.5" />
          <span>{labels.clearFilters}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center sm:p-12">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ShoppingBag className="size-7 stroke-[1.5]" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">
        {labels.emptyCollectionTitle}
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {labels.emptyCollectionDescription}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-secondary px-5 text-xs font-bold text-secondary-foreground shadow-2xs transition-all hover:bg-secondary/80 focus-visible:outline-2 focus-visible:outline-ring"
      >
        {labels.returnHome}
      </Link>
    </div>
  );
}
