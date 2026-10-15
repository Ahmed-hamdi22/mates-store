import type { AdminProductFormData, AdminVariantInput } from './types';

export interface ValidationError {
  field?: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Generate a clean URL-friendly slug from an English title.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars except space and hyphen
    .replace(/[\s_-]+/g, '-')  // collapse spaces and underscores into single hyphen
    .replace(/^-+|-+$/g, '');  // strip leading and trailing hyphens
}

export function validateProductForm(data: AdminProductFormData): ValidationResult {
  const errors: ValidationError[] = [];
  if (!data || !Array.isArray(data.variants) || !Array.isArray(data.images)) {
    return {isValid: false, errors: [{message: 'Invalid product data.'}]};
  }

  // Title EN
  if (!data.titleEn || data.titleEn.trim().length < 2) {
    errors.push({ field: 'titleEn', message: 'English title must be at least 2 characters.' });
  } else if (data.titleEn.trim().length > 200) {
    errors.push({ field: 'titleEn', message: 'English title cannot exceed 200 characters.' });
  }

  // Title AR
  if (!data.titleAr || data.titleAr.trim().length < 2) {
    errors.push({ field: 'titleAr', message: 'Arabic title must be at least 2 characters.' });
  } else if (data.titleAr.trim().length > 200) {
    errors.push({ field: 'titleAr', message: 'Arabic title cannot exceed 200 characters.' });
  }

  // Slug
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!data.slug || !slugRegex.test(data.slug.trim())) {
    errors.push({
      field: 'slug',
      message: 'Slug must contain only lowercase letters, numbers, and hyphens (e.g., matching-hoodie).'
    });
  } else if (data.slug.trim().length > 100) {
    errors.push({ field: 'slug', message: 'Slug cannot exceed 100 characters.' });
  }

  // Status
  const validStatuses = ['draft', 'published', 'archived'];
  if (!validStatuses.includes(data.status)) {
    errors.push({ field: 'status', message: 'Invalid product status.' });
  }

  // Variants validation
  if (!data.variants || data.variants.length === 0) {
    if (data.status === 'published') {
      errors.push({ field: 'variants', message: 'A published product must have at least one variant.' });
    }
  } else {
    if (data.status === 'published' && !data.variants.some((variant) => variant.isActive)) {
      errors.push({field: 'variants', message: 'A published product needs at least one active variant.'});
    }
    const seenCombinations = new Set<string>();
    const seenSkus = new Set<string>();

    data.variants.forEach((v: AdminVariantInput, index: number) => {
      const prefix = `variants[${index}]`;

      if (!v.sizeId || v.sizeId.trim() === '') {
        errors.push({ field: `${prefix}.sizeId`, message: `Variant #${index + 1}: Size is required.` });
      }

      if (!v.colorId || v.colorId.trim() === '') {
        errors.push({ field: `${prefix}.colorId`, message: `Variant #${index + 1}: Color is required.` });
      }

      if (!v.sku || v.sku.trim() === '') {
        errors.push({ field: `${prefix}.sku`, message: `Variant #${index + 1}: SKU is required.` });
      } else {
        const skuNorm = v.sku.trim().toUpperCase();
        if (seenSkus.has(skuNorm)) {
          errors.push({
            field: `${prefix}.sku`,
            message: `Variant #${index + 1}: Duplicate SKU "${v.sku.trim()}". SKUs must be unique.`
          });
        }
        seenSkus.add(skuNorm);
      }

      // Check unique (size, color)
      if (v.sizeId && v.colorId) {
        const comboKey = `${v.sizeId}::${v.colorId}`;
        if (seenCombinations.has(comboKey)) {
          errors.push({
            field: `${prefix}.combination`,
            message: `Variant #${index + 1}: Duplicate size and color combination. Each variant must be unique.`
          });
        }
        seenCombinations.add(comboKey);
      }

      // Price EGP
      if (!Number.isFinite(v.priceEGP) || v.priceEGP <= 0 || !Number.isSafeInteger(Math.round(v.priceEGP * 100)) || Math.abs(v.priceEGP * 100 - Math.round(v.priceEGP * 100)) > 1e-7) {
        errors.push({
          field: `${prefix}.priceEGP`,
          message: `Variant #${index + 1}: Price must be a positive number greater than 0.`
        });
      }

      // Compare-at price
      if (v.compareAtPriceEGP !== null && v.compareAtPriceEGP !== undefined) {
        if (!Number.isFinite(v.compareAtPriceEGP) || v.compareAtPriceEGP < 0 || Math.abs(v.compareAtPriceEGP * 100 - Math.round(v.compareAtPriceEGP * 100)) > 1e-7 || (v.compareAtPriceEGP > 0 && v.compareAtPriceEGP <= v.priceEGP)) {
          errors.push({
            field: `${prefix}.compareAtPriceEGP`,
            message: `Variant #${index + 1}: Original (compare-at) price must be greater than current price.`
          });
        }
      }

      // Stock quantity
      if (
        typeof v.stockQuantity !== 'number' ||
        !Number.isFinite(v.stockQuantity) ||
        v.stockQuantity < 0 ||
        !Number.isInteger(v.stockQuantity)
      ) {
        errors.push({
          field: `${prefix}.stockQuantity`,
          message: `Variant #${index + 1}: Stock quantity must be an integer 0 or greater.`
        });
      }
    });
  }

  // Images validation: ensure only one cover image exists
  if (data.images && data.images.length > 0) {
    const coverCount = data.images.filter((img) => img.isCover).length;
    if (coverCount !== 1) {
      errors.push({ field: 'images', message: 'Select exactly one cover image.' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif'
];

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file format. Allowed types: JPEG, PNG, WebP, AVIF.'
    };
  }

  if (file.size === 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`
    };
  }

  return { isValid: true };
}

export function imageBytesMatchType(bytes: Uint8Array, type: string): boolean {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  if (type === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (type === 'image/avif') return String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp' && ['avif', 'avis'].includes(String.fromCharCode(...bytes.slice(8, 12)));
  return false;
}
