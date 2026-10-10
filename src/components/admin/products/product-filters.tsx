'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/navigation';
import type { AdminReferenceCategory } from '@/features/admin-products/types';
import type { ProductStatus } from '@/types/database';

interface ProductFiltersProps {
  categories: AdminReferenceCategory[];
  currentSearch?: string;
  currentStatus?: ProductStatus | 'all';
  currentCategory?: string | 'all';
  locale: string;
  labels: {
    searchPlaceholder: string;
    allStatuses: string;
    allCategories: string;
    draft: string;
    published: string;
    archived: string;
    clear: string;
  };
}

export function ProductFilters({
  categories,
  currentSearch = '',
  currentStatus = 'all',
  currentCategory = 'all',
  locale,
  labels
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isArabic = locale === 'ar';

  const [search, setSearch] = useState(currentSearch);

  const applyParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyParam('q', search.trim() || null);
  };

  const handleClear = () => {
    setSearch('');
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    (currentSearch && currentSearch.trim().length > 0) ||
      (currentStatus && currentStatus !== 'all') ||
      (currentCategory && currentCategory !== 'all')
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="h-9 w-full rounded-lg border border-border bg-card pe-9 ps-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                applyParam('q', null);
              }}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </form>

        {/* Status Filter */}
        <select
          value={currentStatus}
          onChange={(e) => applyParam('status', e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground outline-none hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="all">{labels.allStatuses}</option>
          <option value="draft">{labels.draft}</option>
          <option value="published">{labels.published}</option>
          <option value="archived">{labels.archived}</option>
        </select>

        {/* Category Filter */}
        {categories.length > 0 && (
          <select
            value={currentCategory}
            onChange={(e) => applyParam('categoryId', e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground outline-none hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">{labels.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {isArabic ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>
        )}
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground sm:self-auto"
        >
          <X className="size-3.5" />
          <span>{labels.clear}</span>
        </button>
      )}
    </div>
  );
}