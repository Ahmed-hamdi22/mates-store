import type { ProductStatus } from '@/types/database';

export interface AdminProductListItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  status: ProductStatus;
  categoryId: string | null;
  categoryNameEn: string | null;
  categoryNameAr: string | null;
  variantsCount: number;
  totalStock: number;
  minPriceCents: number;
  maxPriceCents: number;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminVariantInput {
  id?: string;
  sizeId: string;
  colorId: string;
  sku: string;
  priceEGP: number;
  compareAtPriceEGP?: number | null;
  stockQuantity: number;
  isActive: boolean;
}

export interface AdminImageInput {
  id?: string;
  storagePath: string;
  publicUrl: string;
  sortOrder: number;
  isCover: boolean;
}

export interface AdminProductFormData {
  id?: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  descriptionEn: string;
  descriptionAr: string;
  categoryId: string | null;
  status: ProductStatus;
  variants: AdminVariantInput[];
  images: AdminImageInput[];
}

export interface AdminReferenceCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
}

export interface AdminReferenceSize {
  id: string;
  label: string;
  sortOrder: number;
}

export interface AdminReferenceColor {
  id: string;
  nameEn: string;
  nameAr: string;
  hexCode: string;
  sortOrder: number;
}

export interface AdminReferenceData {
  categories: AdminReferenceCategory[];
  sizes: AdminReferenceSize[];
  colors: AdminReferenceColor[];
}

export interface AdminProductFilters {
  q?: string;
  status?: ProductStatus | 'all';
  categoryId?: string | 'all';
}