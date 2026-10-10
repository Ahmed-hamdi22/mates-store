/**
 * Mates Store — Product Catalog Domain Types
 */

export interface CatalogColor {
  id: string;
  name: string;
  hexCode: string;
}

export interface CatalogSize {
  id: string;
  label: string;
}

/**
 * Resolved variant belonging to a catalog product.
 * Used for variant-level compound filtering (size + color + price).
 */
export interface CatalogVariant {
  id: string;
  sizeId: string;
  sizeLabel: string;
  colorId: string;
  colorName: string;
  colorHex: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  stockQuantity: number;
  isActive: boolean;
}

/**
 * CatalogProduct Domain Entity.
 *
 * PRICING & INVENTORY RULES:
 * 1. Variant Authority: Prices and stock belong strictly to variants.
 * 2. Starting Price (minPriceCents): Derived from the lowest active sellable variant price.
 * 3. Compare-at Discount: Only displayed when the lowest active variant has compare_at_price_cents > price_cents.
 * 4. Compound Filtering: When size and color are selected simultaneously, a product matches
 *    if and only if at least one individual active variant satisfies BOTH criteria.
 * 5. Sorting Rule: Price sorting ('price-asc' and 'price-desc') consistently sorts by the
 *    product's baseline minPriceCents across the entire filtered collection.
 */
export interface CatalogProduct {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  minPriceCents: number;
  maxPriceCents: number;
  compareAtPriceCents: number | null;
  isOutOfStock: boolean;
  totalStock: number;
  coverImage: string | null;
  secondaryImage: string | null;
  colors: CatalogColor[];
  sizes: CatalogSize[];
  variants: CatalogVariant[];
  createdAt: string;
}

export interface CatalogCategoryOption {
  id: string;
  slug: string;
  name: string;
  count: number;
}

export interface CatalogSizeOption {
  id: string;
  label: string;
  count: number;
}

export interface CatalogColorOption {
  id: string;
  name: string;
  hexCode: string;
  count: number;
}

export interface CatalogFilterOptions {
  categories: CatalogCategoryOption[];
  sizes: CatalogSizeOption[];
  colors: CatalogColorOption[];
  minPriceCents: number;
  maxPriceCents: number;
}

export type CatalogSortOption = 'newest' | 'price-asc' | 'price-desc';

export interface CatalogSearchParams {
  category?: string;
  size?: string;
  color?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sort?: CatalogSortOption;
  [key: string]: string | undefined;
}

export interface CatalogData {
  status: 'ready' | 'empty' | 'unconfigured' | 'unavailable';
  products: CatalogProduct[];
  totalCount: number;
  filterOptions: CatalogFilterOptions;
  activeCategory: { id: string; slug: string; name: string } | null;
}
