import {createClient} from '@/lib/supabase/server';
import type {CatalogProduct} from '@/types/catalog';
import type {Category, Color, Product, ProductImage, ProductVariant, Size} from '@/types/database';

export async function getProductBySlug(
  slug: string,
  locale: string = 'en'
): Promise<CatalogProduct | null> {
  const isArabic = locale === 'ar';

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ) {
    return null;
  }

  try {
    const supabase = await createClient();

    // 1. Fetch published product
    const {data: product, error: prodErr} = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (prodErr || !product) {
      return null;
    }

    const p = product as Product;

    // 2. Fetch category, variants, and images in parallel
    const [catRes, variantsRes, imagesRes, sizesRes, colorsRes] = await Promise.all([
      p.category_id ? supabase.from('categories').select('*').eq('id', p.category_id).maybeSingle() : Promise.resolve({data: null}),
      supabase.from('product_variants').select('*').eq('product_id', p.id).eq('is_active', true),
      supabase
        .from('product_images')
        .select('*')
        .eq('product_id', p.id)
        .order('is_cover', {ascending: false})
        .order('sort_order', {ascending: true}),
      supabase.from('sizes').select('*'),
      supabase.from('colors').select('*')
    ]);

    const category = (catRes.data ?? null) as Category | null;
    const variants = (variantsRes.data ?? []) as ProductVariant[];
    const images = (imagesRes.data ?? []) as ProductImage[];
    const sizes = (sizesRes.data ?? []) as Size[];
    const colors = (colorsRes.data ?? []) as Color[];

    const sizeById = new Map<string, Size>(sizes.map((s) => [s.id, s]));
    const colorById = new Map<string, Color>(colors.map((c) => [c.id, c]));

    let minPriceCents = 0;
    let maxPriceCents = 0;
    let compareAtPriceCents: number | null = null;
    let totalStock = 0;

    if (variants.length > 0) {
      minPriceCents = Math.min(...variants.map((v) => v.price_cents));
      maxPriceCents = Math.max(...variants.map((v) => v.price_cents));
      totalStock = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);

      const lowestVariant = variants.reduce((min, curr) =>
        curr.price_cents < min.price_cents ? curr : min
      );
      if (
        lowestVariant.compare_at_price_cents &&
        lowestVariant.compare_at_price_cents > lowestVariant.price_cents
      ) {
        compareAtPriceCents = lowestVariant.compare_at_price_cents;
      }
    }

    const seenColors = new Set<string>();
    const productColors = [];
    for (const v of variants) {
      if (!seenColors.has(v.color_id)) {
        seenColors.add(v.color_id);
        const col = colorById.get(v.color_id);
        if (col) {
          productColors.push({
            id: col.id,
            name: isArabic ? col.name_ar : col.name_en,
            hexCode: col.hex_code
          });
        }
      }
    }

    const seenSizes = new Set<string>();
    const productSizes = [];
    for (const v of variants) {
      if (!seenSizes.has(v.size_id)) {
        seenSizes.add(v.size_id);
        const sz = sizeById.get(v.size_id);
        if (sz) {
          productSizes.push({
            id: sz.id,
            label: sz.label
          });
        }
      }
    }

    const getImageUrl = (path: string | null | undefined): string | null => {
      if (!path) return null;
      return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    };

    const coverImg = images.find((img) => img.is_cover) ?? images[0];
    const secondaryImg = images.length > 1 ? (images[1] !== coverImg ? images[1] : images[0]) : null;

    const resolvedVariants = variants.map((v) => {
      const sz = sizeById.get(v.size_id);
      const col = colorById.get(v.color_id);
      return {
        id: v.id,
        sizeId: v.size_id,
        sizeLabel: sz?.label ?? '',
        colorId: v.color_id,
        colorName: col ? (isArabic ? col.name_ar : col.name_en) : '',
        colorHex: col?.hex_code ?? '#000000',
        priceCents: v.price_cents,
        compareAtPriceCents: v.compare_at_price_cents,
        stockQuantity: v.stock_quantity ?? 0,
        isActive: v.is_active ?? true
      };
    });

    return {
      id: p.id,
      slug: p.slug,
      title: isArabic ? p.title_ar : p.title_en,
      description: isArabic ? p.description_ar : p.description_en,
      categoryId: category?.id ?? null,
      categorySlug: category?.slug ?? null,
      categoryName: category ? (isArabic ? category.name_ar : category.name_en) : null,
      minPriceCents,
      maxPriceCents,
      compareAtPriceCents,
      isOutOfStock: totalStock === 0,
      totalStock,
      coverImage: getImageUrl(coverImg?.storage_path),
      secondaryImage: getImageUrl(secondaryImg?.storage_path),
      colors: productColors,
      sizes: productSizes,
      variants: resolvedVariants,
      createdAt: p.created_at
    };
  } catch {
    return null;
  }
}
