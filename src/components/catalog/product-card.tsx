import Image from 'next/image';
import {ShoppingBag} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {formatPrice} from '@/lib/format-currency';
import type {CatalogProduct} from '@/types/catalog';

interface ProductCardProps {
  product: CatalogProduct;
  locale?: string;
  labels: {
    from: string;
    outOfStock: string;
    sale: string;
    imagePending: string;
  };
}

export function ProductCard({product, locale = 'en', labels}: ProductCardProps) {
  const isArabic = locale === 'ar';
  const hasPriceRange = product.minPriceCents < product.maxPriceCents;
  const hasDiscount =
    product.compareAtPriceCents !== null && product.compareAtPriceCents > product.minPriceCents;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPriceCents! - product.minPriceCents) / product.compareAtPriceCents!) * 100
      )
    : null;

  const productHref = product.slug ? `/products/${encodeURIComponent(product.slug)}` : '/products';

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-foreground/5">
      {/* Product Image Frame */}
      <Link
        href={productHref}
        className="relative aspect-[3/4] w-full overflow-hidden bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        tabIndex={0}
        aria-label={product.title}
      >
        {product.coverImage ? (
          <>
            <Image
              src={product.coverImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                product.secondaryImage ? 'group-hover:opacity-0 transition-opacity' : ''
              }`}
            />
            {product.secondaryImage && (
              <Image
                src={product.secondaryImage}
                alt={`${product.title} alternative view`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="absolute inset-0 object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground/60">
            <ShoppingBag className="size-10 stroke-[1.25] text-muted-foreground/40" />
            <span className="text-xs font-medium tracking-tight text-muted-foreground">
              {labels.imagePending}
            </span>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute start-3 top-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isOutOfStock ? (
            <span className="rounded-md bg-destructive/90 px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-white shadow-xs backdrop-blur-xs dark:text-background">
              {labels.outOfStock}
            </span>
          ) : hasDiscount && discountPercent ? (
            <span className="rounded-md bg-forest px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-cream shadow-xs dark:bg-primary dark:text-primary-foreground">
              {isArabic ? `خصم ${discountPercent}%` : `-${discountPercent}%`}
            </span>
          ) : null}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Category Tag */}
          {product.categoryName && (
            <span className="block text-[0.75rem] font-medium tracking-wider text-muted-foreground">
              {product.categoryName}
            </span>
          )}

          {/* Product Title */}
          <h3 className="mt-1 text-base font-medium text-foreground transition-colors group-hover:text-primary">
            <Link
              href={productHref}
              className="line-clamp-1 focus-visible:outline-none focus-visible:underline"
            >
              {product.title}
            </Link>
          </h3>
        </div>

        {/* Price & Color Swatches Row */}
        <div className="mt-4 flex items-center justify-between gap-3 pt-2">
          {/* Price Block */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-foreground">
                {hasPriceRange && (
                  <span className="me-1 text-xs font-normal text-muted-foreground">
                    {labels.from}
                  </span>
                )}
                {formatPrice(product.minPriceCents, locale)}
              </span>
              {hasDiscount && product.compareAtPriceCents && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.compareAtPriceCents, locale)}
                </span>
              )}
            </div>
          </div>

          {/* Color Dots */}
          {product.colors.length > 0 && (
            <div
              className="flex items-center gap-1.5"
              aria-label={`${product.colors.length} colors available`}
            >
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color.id}
                  title={color.name}
                  className="size-3.5 rounded-full border border-black/15 shadow-2xs dark:border-white/20 transition-transform group-hover:scale-110"
                  style={{backgroundColor: color.hexCode}}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[0.65rem] font-medium text-muted-foreground">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
