import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {ArrowLeft, ChevronRight, Home, Info, ShoppingBag} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {getProductBySlug} from '@/features/catalog/data/get-product-by-slug';
import {Link} from '@/i18n/navigation';
import {formatPrice} from '@/lib/format-currency';

interface ProductDetailPageProps {
  params: Promise<{locale: string; slug: string}>;
}

export async function generateMetadata({
  params
}: ProductDetailPageProps): Promise<Metadata> {
  const {locale, slug} = await params;
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    return {
      title: 'Product Not Found — Mates Store'
    };
  }

  return {
    title: `${product.title} — Mates Store`,
    description: product.description || `Explore ${product.title} on Mates Store.`
  };
}

export default async function ProductDetailPage({params}: ProductDetailPageProps) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const [t, product] = await Promise.all([
    getTranslations({locale, namespace: 'Catalog'}),
    getProductBySlug(slug, locale)
  ]);

  if (!product) {
    notFound();
  }

  const hasPriceRange = product.minPriceCents < product.maxPriceCents;
  const hasDiscount =
    product.compareAtPriceCents !== null && product.compareAtPriceCents > product.minPriceCents;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
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
          className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          {t('breadcrumbProducts')}
        </Link>
        <ChevronRight className="size-3 rtl:rotate-180 text-muted-foreground/60" />
        <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none" aria-current="page">
          {product.title}
        </span>
      </nav>

      {/* Product Boundary Placeholder Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 items-start">
        {/* Product Image Frame */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border bg-card">
          {product.coverImage ? (
            <Image
              src={product.coverImage}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground/70">
              <ShoppingBag className="size-16 stroke-[1.2] text-muted-foreground/40" />
              <span className="text-sm font-medium">{t('imagePending')}</span>
            </div>
          )}

          {product.isOutOfStock ? (
            <span className="absolute start-4 top-4 rounded-md bg-destructive/90 px-3 py-1.5 text-xs font-semibold text-white shadow-xs dark:text-background">
              {t('outOfStock')}
            </span>
          ) : hasDiscount ? (
            <span className="absolute start-4 top-4 rounded-md bg-forest px-3 py-1.5 text-xs font-semibold text-cream shadow-xs dark:bg-primary dark:text-primary-foreground">
              {t('sale')}
            </span>
          ) : null}
        </div>

        {/* Product Details Overview */}
        <div className="flex flex-col gap-6">
          <div>
            {product.categoryName && (
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">
                {product.categoryName}
              </span>
            )}
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {product.title}
            </h1>

            {/* Price Row */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">
                {hasPriceRange && (
                  <span className="me-1.5 text-sm font-normal text-muted-foreground">
                    {t('from')}
                  </span>
                )}
                {formatPrice(product.minPriceCents, locale)}
              </span>
              {hasDiscount && product.compareAtPriceCents && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.compareAtPriceCents, locale)}
                </span>
              )}
            </div>
          </div>

          {/* Available Colors */}
          {product.colors.length > 0 && (
            <div className="border-t border-border/80 pt-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('color')} ({product.colors.length})
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    <span
                      className="size-3.5 rounded-full border border-black/15 dark:border-white/20"
                      style={{backgroundColor: c.hexCode}}
                    />
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Sizes */}
          {product.sizes.length > 0 && (
            <div className="border-t border-border/80 pt-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('size')} ({product.sizes.length})
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex min-w-10 items-center justify-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="border-t border-border/80 pt-5">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Boundary Notice: Feature Coming Soon */}
          <div className="mt-2 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-semibold text-primary">
                {t('detailsComingSoon')}
              </p>
            </div>
          </div>

          {/* Back to Products */}
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-secondary px-6 text-sm font-bold text-secondary-foreground shadow-2xs transition-all hover:bg-secondary/80 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <ArrowLeft className="size-4 rtl:rotate-180" />
              <span>{t('backToProducts')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
