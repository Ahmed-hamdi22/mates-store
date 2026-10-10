import type {Metadata} from 'next';
import {ChevronRight, Home} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {CatalogActiveFilters} from '@/components/catalog/catalog-active-filters';
import {CatalogEmptyState} from '@/components/catalog/catalog-empty-state';
import {CatalogFilters} from '@/components/catalog/catalog-filters';
import {CatalogHeader} from '@/components/catalog/catalog-header';
import {MobileFilterDrawer} from '@/components/catalog/mobile-filter-drawer';
import {ProductCard} from '@/components/catalog/product-card';
import {getCatalogData} from '@/features/catalog/data/get-catalog-data';
import {Link} from '@/i18n/navigation';
import type {CatalogSearchParams, CatalogSortOption} from '@/types/catalog';

interface ProductsPageProps {
  params: Promise<{locale: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Catalog'});
  return {
    title: t('metaTitle'),
    description: t('metaDescription')
  };
}

export default async function ProductsPage({params, searchParams}: ProductsPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const rawSearchParams = await searchParams;

  // Normalize searchParams
  const normalizedParams: CatalogSearchParams = {
    category:
      typeof rawSearchParams.category === 'string'
        ? rawSearchParams.category
        : Array.isArray(rawSearchParams.category)
          ? rawSearchParams.category[0]
          : undefined,
    size:
      typeof rawSearchParams.size === 'string'
        ? rawSearchParams.size
        : Array.isArray(rawSearchParams.size)
          ? rawSearchParams.size.join(',')
          : undefined,
    color:
      typeof rawSearchParams.color === 'string'
        ? rawSearchParams.color
        : Array.isArray(rawSearchParams.color)
          ? rawSearchParams.color.join(',')
          : undefined,
    minPrice:
      typeof rawSearchParams.minPrice === 'string'
        ? rawSearchParams.minPrice
        : Array.isArray(rawSearchParams.minPrice)
          ? rawSearchParams.minPrice[0]
          : undefined,
    maxPrice:
      typeof rawSearchParams.maxPrice === 'string'
        ? rawSearchParams.maxPrice
        : Array.isArray(rawSearchParams.maxPrice)
          ? rawSearchParams.maxPrice[0]
          : undefined,
    sort: (typeof rawSearchParams.sort === 'string'
      ? rawSearchParams.sort
      : 'newest') as CatalogSortOption,
    q:
      typeof rawSearchParams.q === 'string'
        ? rawSearchParams.q
        : Array.isArray(rawSearchParams.q)
          ? rawSearchParams.q[0]
          : undefined
  };

  const [t, catalogData] = await Promise.all([
    getTranslations({locale, namespace: 'Catalog'}),
    getCatalogData(normalizedParams, locale)
  ]);

  const hasAnyFilter = Boolean(
    (normalizedParams.category && normalizedParams.category !== 'all') ||
      normalizedParams.size ||
      normalizedParams.color ||
      normalizedParams.minPrice ||
      normalizedParams.maxPrice ||
      normalizedParams.q
  );

  const cardLabels = {
    from: t('from'),
    outOfStock: t('outOfStock'),
    sale: t('sale'),
    imagePending: t('imagePending')
  };

  const filterLabels = {
    filters: t('filters'),
    filterButton: t('filterButton'),
    clearAll: t('clearAll'),
    category: t('category'),
    allCategories: t('allCategories'),
    size: t('size'),
    color: t('color'),
    price: t('price'),
    minPrice: t('minPrice'),
    maxPrice: t('maxPrice'),
    apply: t('apply'),
    search: t('search'),
    searchPlaceholder: t('searchPlaceholder'),
    viewResults: t('viewResults')
  };

  const headerLabels = {
    productsCount: t('productsCount'),
    sortBy: t('sortBy'),
    sortNewest: t('sortNewest'),
    sortPriceAsc: t('sortPriceAsc'),
    sortPriceDesc: t('sortPriceDesc')
  };

  const activeFilterLabels = {
    clearAll: t('clearAll'),
    category: t('category'),
    size: t('size'),
    color: t('color'),
    price: t('price'),
    search: t('search')
  };

  const emptyStateLabels = {
    noProductsTitle: t('noProductsTitle'),
    noProductsDescription: t('noProductsDescription'),
    clearFilters: t('clearFilters'),
    emptyCollectionTitle: t('emptyCollectionTitle'),
    emptyCollectionDescription: t('emptyCollectionDescription'),
    returnHome: t('returnHome')
  };

  const pageTitle = catalogData.activeCategory
    ? catalogData.activeCategory.name
    : t('title');

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/"
          className="flex items-center gap-1 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Home className="size-3.5" />
          <span>{t('breadcrumbHome')}</span>
        </Link>
        <ChevronRight className="size-3 rtl:rotate-180 text-muted-foreground/60" />
        <Link
          href="/products"
          className={
            catalogData.activeCategory
              ? 'transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring'
              : 'font-semibold text-foreground'
          }
        >
          {t('breadcrumbProducts')}
        </Link>
        {catalogData.activeCategory && (
          <>
            <ChevronRight className="size-3 rtl:rotate-180 text-muted-foreground/60" />
            <span className="font-semibold text-foreground" aria-current="page">
              {catalogData.activeCategory.name}
            </span>
          </>
        )}
      </nav>

      {/* Catalog Title & Sort Header */}
      <CatalogHeader
        title={pageTitle}
        subtitle={t('subtitle')}
        totalCount={catalogData.totalCount}
        currentSort={normalizedParams.sort || 'newest'}
        searchParams={normalizedParams}
        locale={locale}
        labels={headerLabels}
      />

      {/* Mobile Filter Button & Active Filter Bar */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <MobileFilterDrawer
            filterOptions={catalogData.filterOptions}
            searchParams={normalizedParams}
            locale={locale}
            totalCount={catalogData.totalCount}
            labels={filterLabels}
          />
          <span className="text-xs font-semibold text-muted-foreground">
            {catalogData.totalCount} {t('productsCount')}
          </span>
        </div>

        <CatalogActiveFilters
          filterOptions={catalogData.filterOptions}
          searchParams={normalizedParams}
          labels={activeFilterLabels}
        />
      </div>

      {/* Main Grid & Desktop Sidebar */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:gap-10 items-start">
        {/* Desktop Sidebar Filters */}
        <aside
          aria-label={t('filters')}
          className="hidden lg:block sticky top-24 rounded-2xl border border-border/70 bg-card p-6 shadow-xs"
        >
          <CatalogFilters
            filterOptions={catalogData.filterOptions}
            searchParams={normalizedParams}
            locale={locale}
            labels={filterLabels}
          />
        </aside>

        {/* Product Grid Area */}
        <section aria-label={pageTitle} className="min-w-0">
          {catalogData.products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {catalogData.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  labels={cardLabels}
                />
              ))}
            </div>
          ) : (
            <CatalogEmptyState
              hasFilters={hasAnyFilter}
              labels={emptyStateLabels}
            />
          )}
        </section>
      </div>
    </div>
  );
}
