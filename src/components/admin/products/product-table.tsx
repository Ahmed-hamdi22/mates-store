import Image from 'next/image';
import { Edit2, Package, Plus, ShoppingBag } from 'lucide-react';
import { DeleteProductDialog } from './delete-product-dialog';
import { StatusBadge } from './status-badge';
import type { AdminProductListItem } from '@/features/admin-products/types';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/format-currency';

interface ProductTableProps {
  products: AdminProductListItem[];
  hasFilters: boolean;
  locale: string;
  labels: {
    product: string;
    category: string;
    status: string;
    variants: string;
    price: string;
    inventory: string;
    created: string;
    actions: string;
    edit: string;
    delete: string;
    outOfStock: string;
    inStock: string;
    noProductsTitle: string;
    noProductsDescription: string;
    createFirstProduct: string;
    noResultsTitle: string;
    noResultsDescription: string;
    deleteModalTitle: string;
    deleteModalDescription: string;
    deleteConfirm: string;
    deleteCancel: string;
    deleting: string;
    deleteFailed: string;
    statusDraft: string;
    statusPublished: string;
    statusArchived: string;
  };
}

export function ProductTable({ products, hasFilters, locale, labels }: ProductTableProps) {
  const isArabic = locale === 'ar';

  if (products.length === 0) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center sm:p-12">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Package className="size-7 stroke-[1.5]" />
        </div>
        <h3 className="mt-4 text-base font-bold text-foreground">
          {hasFilters ? labels.noResultsTitle : labels.noProductsTitle}
        </h3>
        <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
          {hasFilters ? labels.noResultsDescription : labels.noProductsDescription}
        </p>
        {!hasFilters && <Link
          href="/admin/products/new"
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
        >
          <Plus className="size-3.5" />
          <span>{labels.createFirstProduct}</span>
        </Link>}
      </div>
    );
  }

  const statusLabels = {
    draft: labels.statusDraft,
    published: labels.statusPublished,
    archived: labels.statusArchived
  };

  const deleteDialogLabels = {
    delete: labels.delete,
    title: labels.deleteModalTitle,
    description: labels.deleteModalDescription,
    confirm: labels.deleteConfirm,
    cancel: labels.deleteCancel,
    deleting: labels.deleting,
    errorGeneric: labels.deleteFailed
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <th scope="col" className="px-4 py-3 text-start sm:px-6">{labels.product}</th>
              <th scope="col" className="px-4 py-3 text-start hidden sm:table-cell">{labels.category}</th>
              <th scope="col" className="px-4 py-3 text-start">{labels.status}</th>
              <th scope="col" className="px-4 py-3 text-start hidden md:table-cell">{labels.variants}</th>
              <th scope="col" className="px-4 py-3 text-start">{labels.price}</th>
              <th scope="col" className="px-4 py-3 text-start hidden lg:table-cell">{labels.inventory}</th>
              <th scope="col" className="px-4 py-3 text-end sm:px-6">{labels.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {products.map((product) => {
              const categoryName = isArabic ? product.categoryNameAr : product.categoryNameEn;
              const title = isArabic ? product.titleAr : product.titleEn;
              const secondaryTitle = isArabic ? product.titleEn : product.titleAr;

              return (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  {/* Product Column */}
                  <td className="px-4 py-3.5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {product.coverImageUrl ? (
                          <Image
                            src={product.coverImageUrl}
                            alt={title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground/50">
                            <ShoppingBag className="size-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="font-bold text-foreground transition-colors hover:text-primary hover:underline line-clamp-1"
                        >
                          {title}
                        </Link>
                        {secondaryTitle && (
                          <span className="block text-[0.7rem] text-muted-foreground line-clamp-1">
                            {secondaryTitle}
                          </span>
                        )}
                        <span className="block text-[0.65rem] font-mono text-muted-foreground/70">
                          /{product.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category Column */}
                  <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                    {categoryName ? (
                      <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[0.7rem] font-medium text-secondary-foreground">
                        {categoryName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={product.status} labels={statusLabels} />
                  </td>

                  {/* Variants Count */}
                  <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">
                    <span className="font-semibold text-foreground">
                      {product.variantsCount}
                    </span>{' '}
                    <span>{labels.variants}</span>
                  </td>

                  {/* Price Column */}
                  <td className="px-4 py-3.5 font-medium text-foreground">
                    {product.minPriceCents > 0 ? (
                      product.minPriceCents === product.maxPriceCents ? (
                        formatPrice(product.minPriceCents, locale)
                      ) : (
                        <span>
                          {formatPrice(product.minPriceCents, locale)} – {formatPrice(product.maxPriceCents, locale)}
                        </span>
                      )
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>

                  {/* Inventory Column */}
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    {product.totalStock === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-destructive">
                        {labels.outOfStock}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-foreground">
                        <span className="font-bold">{product.totalStock}</span> {labels.inStock}
                      </span>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3.5 text-end sm:px-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                        title={labels.edit}
                      >
                        <Edit2 className="size-3.5" />
                        <span className="sr-only">{labels.edit}</span>
                      </Link>
                      <DeleteProductDialog
                        productId={product.id}
                        productTitle={title}
                        locale={locale}
                        labels={deleteDialogLabels}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
