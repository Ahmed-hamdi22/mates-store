'use client';

import {useState} from 'react';
import {SlidersHorizontal, X} from 'lucide-react';
import {Dialog} from 'radix-ui';
import {CatalogFilters} from '@/components/catalog/catalog-filters';
import type {CatalogFilterOptions, CatalogSearchParams} from '@/types/catalog';

interface MobileFilterDrawerProps {
  filterOptions: CatalogFilterOptions;
  searchParams: CatalogSearchParams;
  locale: string;
  totalCount: number;
  labels: {
    filters: string;
    filterButton: string;
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
    viewResults: string;
  };
}

export function MobileFilterDrawer({
  filterOptions,
  searchParams,
  locale,
  totalCount,
  labels
}: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  // Count active filters
  let activeCount = 0;
  if (searchParams.category && searchParams.category !== 'all') activeCount++;
  if (searchParams.size) activeCount += searchParams.size.split(',').length;
  if (searchParams.color) activeCount += searchParams.color.split(',').length;
  if (searchParams.minPrice || searchParams.maxPrice) activeCount++;
  if (searchParams.q) activeCount++;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring lg:hidden">
        <SlidersHorizontal className="size-3.5" />
        <span>{labels.filterButton}</span>
        {activeCount > 0 && (
          <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-[0.65rem] font-bold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-2xs" />
        <Dialog.Content className="fixed inset-y-0 start-0 z-50 flex w-[min(24rem,85vw)] flex-col border-e border-border bg-background p-6 text-foreground shadow-2xl outline-none overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <Dialog.Title className="text-lg font-bold tracking-tight">
              {labels.filters}
            </Dialog.Title>
            <Dialog.Close className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Filter the product catalog by category, size, color, or price.
          </Dialog.Description>

          <div className="mt-6 flex-1">
            <CatalogFilters
              filterOptions={filterOptions}
              searchParams={searchParams}
              locale={locale}
              labels={labels}
              onApplyMobile={() => setOpen(false)}
            />
          </div>

          <div className="mt-8 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-ring"
            >
              {labels.viewResults} ({totalCount})
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
