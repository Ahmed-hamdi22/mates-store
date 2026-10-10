'use client';

import {useState} from 'react';
import {Search, X} from 'lucide-react';
import {useRouter, usePathname} from '@/i18n/navigation';
import type {CatalogFilterOptions, CatalogSearchParams} from '@/types/catalog';

interface CatalogFiltersProps {
  filterOptions: CatalogFilterOptions;
  searchParams: CatalogSearchParams;
  locale: string;
  labels: {
    filters: string;
    clearAll: string;
    category: string;
    allCategories: string;
    size: string;
    color: string;
    price: string;
    minPrice: string;
    maxPrice: string;
    apply: string;
    search: string;
    searchPlaceholder: string;
  };
  onApplyMobile?: () => void;
}

export function CatalogFilters({
  filterOptions,
  searchParams,
  labels,
  onApplyMobile
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Local state for price inputs & search
  const [minPriceInput, setMinPriceInput] = useState(searchParams.minPrice || '');
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.maxPrice || '');
  const [searchInput, setSearchInput] = useState(searchParams.q || '');

  // Synchronize state during render when URL query changes (React recommended pattern)
  const [prevParams, setPrevParams] = useState({
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    q: searchParams.q
  });

  if (
    searchParams.minPrice !== prevParams.minPrice ||
    searchParams.maxPrice !== prevParams.maxPrice ||
    searchParams.q !== prevParams.q
  ) {
    setPrevParams({
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      q: searchParams.q
    });
    setMinPriceInput(searchParams.minPrice || '');
    setMaxPriceInput(searchParams.maxPrice || '');
    setSearchInput(searchParams.q || '');
  }

  const hasActiveFilters = Boolean(
    (searchParams.category && searchParams.category !== 'all') ||
      searchParams.size ||
      searchParams.color ||
      searchParams.minPrice ||
      searchParams.maxPrice ||
      searchParams.q
  );

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== key) {
        params.set(k, v);
      }
    }
    if (value && value.trim().length > 0 && value !== 'all') {
      params.set(key, value.trim());
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    if (onApplyMobile) onApplyMobile();
  };

  const toggleArrayParam = (key: 'size' | 'color', itemValue: string) => {
    const currentValues = (searchParams[key] || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const valLower = itemValue.toLowerCase();
    const newValues = currentValues.includes(valLower)
      ? currentValues.filter((v) => v !== valLower)
      : [...currentValues, valLower];

    updateParam(key, newValues.length > 0 ? newValues.join(',') : null);
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== 'minPrice' && k !== 'maxPrice') {
        params.set(k, v);
      }
    }
    if (minPriceInput.trim()) params.set('minPrice', minPriceInput.trim());
    if (maxPriceInput.trim()) params.set('maxPrice', maxPriceInput.trim());

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    if (onApplyMobile) onApplyMobile();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', searchInput);
  };

  const handleClearAll = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchInput('');
    const params = new URLSearchParams();
    if (searchParams.sort && searchParams.sort !== 'newest') {
      params.set('sort', searchParams.sort);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    if (onApplyMobile) onApplyMobile();
  };

  const activeSizes = (searchParams.size || '')
    .split(',')
    .map((s) => s.trim().toLowerCase());

  const activeColors = (searchParams.color || '')
    .split(',')
    .map((c) => c.trim().toLowerCase());

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Title and Clear All */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
          {labels.filters}
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            {labels.clearAll}
          </button>
        )}
      </div>

      {/* Search Input Filter */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="h-10 w-full rounded-lg border border-border bg-card pe-9 ps-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {searchInput ? (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              updateParam('q', null);
            }}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <button
            type="submit"
            className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={labels.search}
          >
            <Search className="size-3.5" />
          </button>
        )}
      </form>

      {/* Categories Filter */}
      {filterOptions.categories.length > 0 && (
        <div className="border-b border-border/60 pb-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {labels.category}
          </h3>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li>
              <button
                type="button"
                onClick={() => updateParam('category', null)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-start transition-colors ${
                  !searchParams.category || searchParams.category === 'all'
                    ? 'bg-accent/80 font-bold text-accent-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span>{labels.allCategories}</span>
              </button>
            </li>
            {filterOptions.categories.map((cat) => {
              const isActive =
                searchParams.category?.toLowerCase() === cat.slug.toLowerCase() ||
                searchParams.category === cat.id;
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => updateParam('category', cat.slug)}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-start transition-colors ${
                      isActive
                        ? 'bg-accent/80 font-bold text-accent-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-muted-foreground">({cat.count})</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Sizes Filter */}
      {filterOptions.sizes.length > 0 && (
        <div className="border-b border-border/60 pb-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {labels.size}
          </h3>
          <div className="flex flex-wrap gap-2">
            {filterOptions.sizes.map((sz) => {
              const isChecked =
                activeSizes.includes(sz.label.toLowerCase()) ||
                activeSizes.includes(sz.id.toLowerCase());
              return (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => toggleArrayParam('size', sz.label)}
                  className={`inline-flex min-w-10 items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    isChecked
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : 'border-border bg-card text-foreground hover:border-foreground/40 hover:bg-muted'
                  }`}
                  aria-pressed={isChecked}
                >
                  {sz.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors Filter */}
      {filterOptions.colors.length > 0 && (
        <div className="border-b border-border/60 pb-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {labels.color}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {filterOptions.colors.map((col) => {
              const isChecked =
                activeColors.includes(col.name.toLowerCase()) ||
                activeColors.includes(col.hexCode.toLowerCase()) ||
                activeColors.includes(col.id.toLowerCase());
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => toggleArrayParam('color', col.name)}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all text-start ${
                    isChecked
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                      : 'border-border bg-card text-foreground hover:border-foreground/30 hover:bg-muted'
                  }`}
                  aria-pressed={isChecked}
                >
                  <span
                    className="size-3.5 shrink-0 rounded-full border border-black/15 dark:border-white/20 shadow-2xs"
                    style={{backgroundColor: col.hexCode}}
                  />
                  <span className="truncate">{col.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {labels.price} (EGP)
        </h3>
        <form onSubmit={handlePriceSubmit} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder={labels.minPrice}
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="number"
              min={0}
              placeholder={labels.maxPrice}
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="h-8 rounded-lg bg-secondary px-3 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-2 focus-visible:outline-ring"
          >
            {labels.apply}
          </button>
        </form>
      </div>
    </div>
  );
}
