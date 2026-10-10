'use client';

import {useRouter, usePathname} from '@/i18n/navigation';
import {ArrowUpDown} from 'lucide-react';
import type {CatalogSearchParams, CatalogSortOption} from '@/types/catalog';

interface CatalogHeaderProps {
  title: string;
  subtitle: string;
  totalCount: number;
  currentSort: CatalogSortOption;
  searchParams: CatalogSearchParams;
  locale: string;
  labels: {
    productsCount: string;
    sortBy: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
  };
}

export function CatalogHeader({
  title,
  subtitle,
  totalCount,
  currentSort,
  searchParams,
  labels
}: CatalogHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams();
    // Preserve existing search params
    for (const [key, val] of Object.entries(searchParams)) {
      if (val && key !== 'sort') {
        params.set(key, val);
      }
    }
    if (newSort !== 'newest') {
      params.set('sort', newSort);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
        <span className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
          {totalCount} {labels.productsCount}
        </span>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <label htmlFor="catalog-sort" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <ArrowUpDown className="size-3.5" />
          <span>{labels.sortBy}:</span>
        </label>
        <select
          id="catalog-sort"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="newest">{labels.sortNewest}</option>
          <option value="price-asc">{labels.sortPriceAsc}</option>
          <option value="price-desc">{labels.sortPriceDesc}</option>
        </select>
      </div>
    </div>
  );
}
