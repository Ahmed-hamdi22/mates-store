'use client';

import {X} from 'lucide-react';
import {useRouter, usePathname} from '@/i18n/navigation';
import type {CatalogFilterOptions, CatalogSearchParams} from '@/types/catalog';

interface CatalogActiveFiltersProps {
  filterOptions: CatalogFilterOptions;
  searchParams: CatalogSearchParams;
  labels: {
    clearAll: string;
    category: string;
    size: string;
    color: string;
    price: string;
    search: string;
  };
}

export function CatalogActiveFilters({
  filterOptions,
  searchParams,
  labels
}: CatalogActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const removeParam = (key: string, valueToRemove?: string) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (!v) continue;

      if (k === key) {
        if (valueToRemove && (k === 'size' || k === 'color')) {
          const remaining = (v as string)
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.toLowerCase() !== valueToRemove.toLowerCase());
          if (remaining.length > 0) {
            params.set(k, remaining.join(','));
          }
        }
      } else {
        params.set(k, v);
      }
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const removePriceRange = () => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== 'minPrice' && k !== 'maxPrice') {
        params.set(k, v);
      }
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    if (searchParams.sort && searchParams.sort !== 'newest') {
      params.set('sort', searchParams.sort);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const items: Array<{id: string; label: string; onRemove: () => void}> = [];

  // Category
  if (searchParams.category && searchParams.category !== 'all') {
    const cat = filterOptions.categories.find(
      (c) =>
        c.slug.toLowerCase() === searchParams.category?.toLowerCase() ||
        c.id === searchParams.category
    );
    items.push({
      id: `cat-${searchParams.category}`,
      label: `${labels.category}: ${cat?.name || searchParams.category}`,
      onRemove: () => removeParam('category')
    });
  }

  // Sizes
  if (searchParams.size) {
    const sizes = searchParams.size.split(',').map((s) => s.trim());
    for (const s of sizes) {
      items.push({
        id: `size-${s}`,
        label: `${labels.size}: ${s.toUpperCase()}`,
        onRemove: () => removeParam('size', s)
      });
    }
  }

  // Colors
  if (searchParams.color) {
    const colors = searchParams.color.split(',').map((c) => c.trim());
    for (const c of colors) {
      const colObj = filterOptions.colors.find(
        (col) =>
          col.name.toLowerCase() === c.toLowerCase() ||
          col.hexCode.toLowerCase() === c.toLowerCase() ||
          col.id === c
      );
      items.push({
        id: `color-${c}`,
        label: `${labels.color}: ${colObj?.name || c}`,
        onRemove: () => removeParam('color', c)
      });
    }
  }

  // Price range
  if (searchParams.minPrice || searchParams.maxPrice) {
    const min = searchParams.minPrice ? `${searchParams.minPrice} EGP` : '0';
    const max = searchParams.maxPrice ? `${searchParams.maxPrice} EGP` : '∞';
    items.push({
      id: 'price-range',
      label: `${labels.price}: ${min} - ${max}`,
      onRemove: removePriceRange
    });
  }

  // Search
  if (searchParams.q) {
    items.push({
      id: 'search-query',
      label: `"${searchParams.q}"`,
      onRemove: () => removeParam('q')
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {items.map((item) => (
        <span
          key={item.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-foreground/30"
        >
          <span>{item.label}</span>
          <button
            type="button"
            onClick={item.onRemove}
            className="rounded-full p-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
            aria-label={`Remove filter ${item.label}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs font-semibold text-primary underline-offset-4 hover:underline ms-2"
      >
        {labels.clearAll}
      </button>
    </div>
  );
}
