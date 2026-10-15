import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Plus } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductFilters } from '@/components/admin/products/product-filters';
import { ProductTable } from '@/components/admin/products/product-table';
import { getAdminProducts, getAdminReferenceData } from '@/features/admin-products/queries';
import { getProductAdminClient } from '@/features/admin-products/access';
import { Link } from '@/i18n/navigation';
import type { ProductStatus } from '@/types/database';

interface AdminProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AdminProducts' });
  return {
    title: `${t('title')} — Mates Store Admin`,
    description: t('subtitle')
  };
}

export default async function AdminProductsPage({
  params,
  searchParams
}: AdminProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await getProductAdminClient())) notFound();

  const rawSearchParams = await searchParams;

  const currentSearch = typeof rawSearchParams.q === 'string' ? rawSearchParams.q : undefined;
  const currentStatus = (typeof rawSearchParams.status === 'string'
    ? rawSearchParams.status
    : 'all') as ProductStatus | 'all';
  const currentCategory =
    typeof rawSearchParams.categoryId === 'string' ? rawSearchParams.categoryId : 'all';

  const [t, products, referenceData] = await Promise.all([
    getTranslations({ locale, namespace: 'AdminProducts' }),
    getAdminProducts({
      q: currentSearch,
      status: currentStatus,
      categoryId: currentCategory
    }),
    getAdminReferenceData()
  ]);

  const filterLabels = {
    searchPlaceholder: t('searchPlaceholder'),
    allStatuses: t('allStatuses'),
    allCategories: t('allCategories'),
    draft: t('statusDraft'),
    published: t('statusPublished'),
    archived: t('statusArchived'),
    clear: t('clearFilters')
  };

  const tableLabels = {
    product: t('tableProduct'),
    category: t('tableCategory'),
    status: t('tableStatus'),
    variants: t('tableVariants'),
    price: t('tablePrice'),
    inventory: t('tableInventory'),
    created: t('tableCreated'),
    actions: t('tableActions'),
    edit: t('edit'),
    delete: t('delete'),
    outOfStock: t('outOfStock'),
    inStock: t('inStock'),
    noProductsTitle: t('noProductsTitle'),
    noProductsDescription: t('noProductsDescription'),
    createFirstProduct: t('createFirstProduct'),
    noResultsTitle: t('noResultsTitle'),
    noResultsDescription: t('noResultsDescription'),
    deleteModalTitle: t('deleteModalTitle'),
    deleteModalDescription: t('deleteModalDescription'),
    deleteConfirm: t('deleteConfirm'),
    deleteCancel: t('deleteCancel'),
    deleting: t('deleting'),
    deleteFailed: t('deleteFailed'),
    statusDraft: t('statusDraft'),
    statusPublished: t('statusPublished'),
    statusArchived: t('statusArchived')
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t('subtitle')}
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground shadow-xs transition-opacity hover:opacity-90 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>{t('newProduct')}</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <ProductFilters
        categories={referenceData.categories}
        currentSearch={currentSearch}
        currentStatus={currentStatus}
        currentCategory={currentCategory}
        locale={locale}
        labels={filterLabels}
      />

      {/* Products Table */}
      <ProductTable
        products={products}
        hasFilters={Boolean(currentSearch || currentStatus !== 'all' || currentCategory !== 'all')}
        locale={locale}
        labels={tableLabels}
      />
    </div>
  );
}
