import { getProductAdminClient } from './access';
import type {
  AdminProductFilters,
  AdminProductFormData,
  AdminProductListItem,
  AdminReferenceCategory,
  AdminReferenceColor,
  AdminReferenceData,
  AdminReferenceSize
} from './types';
import type { Category, Color, Product, ProductImage, ProductVariant, Size } from '@/types/database';

export async function getAdminProducts(filters: AdminProductFilters = {}): Promise<AdminProductListItem[]> {
  const supabase = await getProductAdminClient();
  try {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.categoryId && filters.categoryId !== 'all') {
      query = query.eq('category_id', filters.categoryId);
    }

    const { data: rawProducts, error: prodErr } = await query;
    if (prodErr || !rawProducts) {
      throw prodErr ?? new Error('Products query returned no data');
    }

    const products = rawProducts as Product[];
    if (products.length === 0) return [];

    // Filter by search query in-memory or via SQL
    let filteredProducts = products;
    if (filters.q && filters.q.trim().length > 0) {
      const qLower = filters.q.trim().toLowerCase();
      filteredProducts = products.filter(
        (p) =>
          p.title_en.toLowerCase().includes(qLower) ||
          p.title_ar.toLowerCase().includes(qLower) ||
          p.slug.toLowerCase().includes(qLower)
      );
    }

    if (filteredProducts.length === 0) return [];

    const productIds = filteredProducts.map((p) => p.id);

    // Parallel fetch categories, variants, and cover images
    const [categoriesRes, variantsRes, imagesRes] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('product_variants').select('*').in('product_id', productIds),
      supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds)
        .order('is_cover', { ascending: false })
        .order('sort_order', { ascending: true })
    ]);

    if (categoriesRes.error || variantsRes.error || imagesRes.error) {
      throw categoriesRes.error ?? variantsRes.error ?? imagesRes.error;
    }
    const categories = (categoriesRes.data ?? []) as Category[];
    const variants = (variantsRes.data ?? []) as ProductVariant[];
    const images = (imagesRes.data ?? []) as ProductImage[];

    const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

    const variantsByProduct = new Map<string, ProductVariant[]>();
    for (const v of variants) {
      const list = variantsByProduct.get(v.product_id) || [];
      list.push(v);
      variantsByProduct.set(v.product_id, list);
    }

    const coverImageByProduct = new Map<string, ProductImage>();
    for (const img of images) {
      if (!coverImageByProduct.has(img.product_id)) {
        coverImageByProduct.set(img.product_id, img);
      }
    }

    const getStorageUrl = (path: string | null | undefined): string | null => {
      if (!path) return null;
      return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    };

    return filteredProducts.map((p) => {
      const pVariants = variantsByProduct.get(p.id) || [];
      const category = p.category_id ? categoryMap.get(p.category_id) : null;
      const coverImg = coverImageByProduct.get(p.id);

      let minPriceCents = 0;
      let maxPriceCents = 0;
      let totalStock = 0;

      if (pVariants.length > 0) {
        minPriceCents = Math.min(...pVariants.map((v) => v.price_cents));
        maxPriceCents = Math.max(...pVariants.map((v) => v.price_cents));
        totalStock = pVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
      }

      return {
        id: p.id,
        slug: p.slug,
        titleEn: p.title_en,
        titleAr: p.title_ar,
        status: p.status,
        categoryId: p.category_id,
        categoryNameEn: category?.name_en ?? null,
        categoryNameAr: category?.name_ar ?? null,
        variantsCount: pVariants.length,
        totalStock,
        minPriceCents,
        maxPriceCents,
        coverImageUrl: getStorageUrl(coverImg?.storage_path),
        createdAt: p.created_at,
        updatedAt: p.updated_at
      };
    });
  } catch (err) {
    console.error('getAdminProducts exception:', err);
    throw err;
  }
}

export async function getAdminProductById(id: string): Promise<AdminProductFormData | null> {
  const supabase = await getProductAdminClient();
  try {
    const { data: rawProduct, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (prodErr) throw prodErr;
    if (!rawProduct) return null;

    const product = rawProduct as Product;

    // Parallel fetch variants and images
    const [variantsRes, imagesRes] = await Promise.all([
      supabase.from('product_variants').select('*').eq('product_id', id).order('created_at', { ascending: true }),
      supabase.from('product_images').select('*').eq('product_id', id).order('sort_order', { ascending: true })
    ]);

    if (variantsRes.error || imagesRes.error) throw variantsRes.error ?? imagesRes.error;
    const variants = (variantsRes.data ?? []) as ProductVariant[];
    const images = (imagesRes.data ?? []) as ProductImage[];

    const getStorageUrl = (path: string): string => {
      return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    };

    return {
      id: product.id,
      titleEn: product.title_en,
      titleAr: product.title_ar,
      slug: product.slug,
      descriptionEn: product.description_en || '',
      descriptionAr: product.description_ar || '',
      categoryId: product.category_id,
      status: product.status,
      variants: variants.map((v) => ({
        id: v.id,
        sizeId: v.size_id,
        colorId: v.color_id,
        sku: v.sku,
        priceEGP: v.price_cents / 100,
        compareAtPriceEGP: v.compare_at_price_cents ? v.compare_at_price_cents / 100 : null,
        stockQuantity: v.stock_quantity ?? 0,
        isActive: v.is_active ?? true
      })),
      images: images.map((img) => ({
        id: img.id,
        storagePath: img.storage_path,
        publicUrl: getStorageUrl(img.storage_path),
        sortOrder: img.sort_order,
        isCover: img.is_cover
      }))
    };
  } catch (err) {
    console.error('getAdminProductById exception:', err);
    throw err;
  }
}

export async function getAdminReferenceData(): Promise<AdminReferenceData> {
  const supabase = await getProductAdminClient();
  try {
    const [categoriesRes, sizesRes, colorsRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('sizes').select('*').order('sort_order', { ascending: true }),
      supabase.from('colors').select('*').order('sort_order', { ascending: true })
    ]);

    if (categoriesRes.error || sizesRes.error || colorsRes.error) {
      throw categoriesRes.error ?? sizesRes.error ?? colorsRes.error;
    }
    const categories = ((categoriesRes.data ?? []) as Category[]).map(
      (c): AdminReferenceCategory => ({
        id: c.id,
        slug: c.slug,
        nameEn: c.name_en,
        nameAr: c.name_ar
      })
    );

    const sizes = ((sizesRes.data ?? []) as Size[]).map(
      (s): AdminReferenceSize => ({
        id: s.id,
        label: s.label,
        sortOrder: s.sort_order
      })
    );

    const colors = ((colorsRes.data ?? []) as Color[]).map(
      (col): AdminReferenceColor => ({
        id: col.id,
        nameEn: col.name_en,
        nameAr: col.name_ar,
        hexCode: col.hex_code,
        sortOrder: col.sort_order
      })
    );

    return { categories, sizes, colors };
  } catch (err) {
    console.error('getAdminReferenceData exception:', err);
    throw err;
  }
}
