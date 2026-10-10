import {createClient} from '@/lib/supabase/server';
import type {
  CatalogColor,
  CatalogData,
  CatalogFilterOptions,
  CatalogProduct,
  CatalogSearchParams,
  CatalogSize,
  CatalogVariant
} from '@/types/catalog';
import type {Category, Color, Product, ProductImage, ProductVariant, Size} from '@/types/database';

export async function getCatalogData(
  searchParams: CatalogSearchParams = {},
  locale: string = 'en'
): Promise<CatalogData> {
  const isArabic = locale === 'ar';

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ) {
    return {
      status: 'unconfigured',
      products: [],
      totalCount: 0,
      filterOptions: {
        categories: [],
        sizes: [],
        colors: [],
        minPriceCents: 0,
        maxPriceCents: 0
      },
      activeCategory: null
    };
  }

  try {
    const supabase = await createClient();

    // 1. Fetch reference data: categories, sizes, colors, and published products
    const [categoriesRes, sizesRes, colorsRes, productsRes] = await Promise.all([
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order', {ascending: true}),
      supabase.from('sizes').select('*').order('sort_order', {ascending: true}),
      supabase.from('colors').select('*').order('sort_order', {ascending: true}),
      supabase
        .from('products')
        .select('*')
        .eq('status', 'published')
        .order('created_at', {ascending: false})
    ]);

    if (categoriesRes.error || sizesRes.error || colorsRes.error || productsRes.error) {
      return {
        status: 'unavailable',
        products: [],
        totalCount: 0,
        filterOptions: {
          categories: [],
          sizes: [],
          colors: [],
          minPriceCents: 0,
          maxPriceCents: 0
        },
        activeCategory: null
      };
    }

    const categories = (categoriesRes.data ?? []) as Category[];
    const sizes = (sizesRes.data ?? []) as Size[];
    const colors = (colorsRes.data ?? []) as Color[];
    const rawProducts = (productsRes.data ?? []) as Product[];

    if (rawProducts.length === 0) {
      return {
        status: 'empty',
        products: [],
        totalCount: 0,
        filterOptions: {
          categories: categories.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: isArabic ? c.name_ar : c.name_en,
            count: 0
          })),
          sizes: sizes.map((s) => ({id: s.id, label: s.label, count: 0})),
          colors: colors.map((col) => ({
            id: col.id,
            name: isArabic ? col.name_ar : col.name_en,
            hexCode: col.hex_code,
            count: 0
          })),
          minPriceCents: 0,
          maxPriceCents: 0
        },
        activeCategory: null
      };
    }

    const productIds = rawProducts.map((p) => p.id);

    // 2. Fetch variants and images for all published products
    const [variantsRes, imagesRes] = await Promise.all([
      supabase
        .from('product_variants')
        .select('*')
        .in('product_id', productIds)
        .eq('is_active', true),
      supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds)
        .order('is_cover', {ascending: false})
        .order('sort_order', {ascending: true})
    ]);

    const rawVariants = (variantsRes.data ?? []) as ProductVariant[];
    const rawImages = (imagesRes.data ?? []) as ProductImage[];

    // Map helper lookups
    const categoryById = new Map<string, Category>(categories.map((c) => [c.id, c]));
    const sizeById = new Map<string, Size>(sizes.map((s) => [s.id, s]));
    const colorById = new Map<string, Color>(colors.map((c) => [c.id, c]));

    const variantsByProductId = new Map<string, ProductVariant[]>();
    for (const v of rawVariants) {
      const list = variantsByProductId.get(v.product_id) || [];
      list.push(v);
      variantsByProductId.set(v.product_id, list);
    }

    const imagesByProductId = new Map<string, ProductImage[]>();
    for (const img of rawImages) {
      const list = imagesByProductId.get(img.product_id) || [];
      list.push(img);
      imagesByProductId.set(img.product_id, list);
    }

    const getImageUrl = (path: string | null | undefined): string | null => {
      if (!path) return null;
      return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    };

    // 3. Assemble complete CatalogProduct items
    const allCatalogProducts: CatalogProduct[] = rawProducts.map((p) => {
      const pVariants = variantsByProductId.get(p.id) ?? [];
      const pImages = imagesByProductId.get(p.id) ?? [];
      const category = p.category_id ? categoryById.get(p.category_id) : undefined;

      // Calculate pricing from active sellable variants
      let minPriceCents = 0;
      let maxPriceCents = 0;
      let compareAtPriceCents: number | null = null;
      let totalStock = 0;

      if (pVariants.length > 0) {
        minPriceCents = Math.min(...pVariants.map((v) => v.price_cents));
        maxPriceCents = Math.max(...pVariants.map((v) => v.price_cents));
        totalStock = pVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);

        // Find compare-at price from lowest priced variant if applicable
        const lowestVariant = pVariants.reduce((min, curr) =>
          curr.price_cents < min.price_cents ? curr : min
        );
        if (
          lowestVariant.compare_at_price_cents &&
          lowestVariant.compare_at_price_cents > lowestVariant.price_cents
        ) {
          compareAtPriceCents = lowestVariant.compare_at_price_cents;
        }
      }

      // Collect unique colors
      const seenColors = new Set<string>();
      const productColors: CatalogColor[] = [];
      for (const v of pVariants) {
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

      // Collect unique sizes
      const seenSizes = new Set<string>();
      const productSizes: CatalogSize[] = [];
      for (const v of pVariants) {
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

      // Images
      const coverImg = pImages.find((img) => img.is_cover) ?? pImages[0];
      const secondaryImg = pImages.length > 1 ? (pImages[1] !== coverImg ? pImages[1] : pImages[0]) : null;

      // Map resolved variants for compound filtering (size + color + price)
      const resolvedVariants: CatalogVariant[] = pVariants.map((v) => {
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
    });

    // 4. Calculate global filter options across the entire collection
    const categoryCounts = new Map<string, number>();
    const sizeCounts = new Map<string, number>();
    const colorCounts = new Map<string, number>();
    let globalMinPrice = Infinity;
    let globalMaxPrice = 0;

    for (const prod of allCatalogProducts) {
      if (prod.categoryId) {
        categoryCounts.set(prod.categoryId, (categoryCounts.get(prod.categoryId) || 0) + 1);
      }
      for (const s of prod.sizes) {
        sizeCounts.set(s.id, (sizeCounts.get(s.id) || 0) + 1);
      }
      for (const c of prod.colors) {
        colorCounts.set(c.id, (colorCounts.get(c.id) || 0) + 1);
      }
      if (prod.minPriceCents > 0) {
        if (prod.minPriceCents < globalMinPrice) globalMinPrice = prod.minPriceCents;
        if (prod.maxPriceCents > globalMaxPrice) globalMaxPrice = prod.maxPriceCents;
      }
    }

    const filterOptions: CatalogFilterOptions = {
      categories: categories.map((cat) => ({
        id: cat.id,
        slug: cat.slug,
        name: isArabic ? cat.name_ar : cat.name_en,
        count: categoryCounts.get(cat.id) || 0
      })),
      sizes: sizes.map((sz) => ({
        id: sz.id,
        label: sz.label,
        count: sizeCounts.get(sz.id) || 0
      })),
      colors: colors.map((col) => ({
        id: col.id,
        name: isArabic ? col.name_ar : col.name_en,
        hexCode: col.hex_code,
        count: colorCounts.get(col.id) || 0
      })),
      minPriceCents: globalMinPrice === Infinity ? 0 : globalMinPrice,
      maxPriceCents: globalMaxPrice === 0 ? 0 : globalMaxPrice
    };

    // 5. Apply user filters
    let filtered = [...allCatalogProducts];

    // Filter A: Category (slug or id)
    if (searchParams.category && searchParams.category !== 'all') {
      const target = searchParams.category.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.categorySlug?.toLowerCase() === target ||
          p.categoryId === searchParams.category
      );
    }

    // Filter B: Search query (q) - matches localized title, description, or category
    if (searchParams.q && searchParams.q.trim().length > 0) {
      const query = searchParams.q.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(query);
        const descMatch = p.description?.toLowerCase().includes(query);
        const catMatch = p.categoryName?.toLowerCase().includes(query);
        return titleMatch || descMatch || catMatch;
      });
    }

    // Filter C: Compound Variant Filtering (Size, Color, Price Range)
    // CORE RULE: A product matches if and only if AT LEAST ONE of its active variants
    // satisfies ALL specified variant constraints (size, color, minPrice, maxPrice) simultaneously.
    const selectedSizes = searchParams.size
      ? searchParams.size
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const selectedColors = searchParams.color
      ? searchParams.color
          .split(',')
          .map((c) => c.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const minCents = searchParams.minPrice
      ? Math.round(Number(searchParams.minPrice) * 100)
      : null;
    const maxCents = searchParams.maxPrice
      ? Math.round(Number(searchParams.maxPrice) * 100)
      : null;

    const hasVariantFilters =
      selectedSizes.length > 0 ||
      selectedColors.length > 0 ||
      (minCents !== null && !Number.isNaN(minCents) && minCents > 0) ||
      (maxCents !== null && !Number.isNaN(maxCents) && maxCents > 0);

    if (hasVariantFilters) {
      filtered = filtered.filter((product) => {
        return product.variants.some((v) => {
          if (!v.isActive) return false;

          // 1. Size match
          if (selectedSizes.length > 0) {
            const matchesSize =
              selectedSizes.includes(v.sizeLabel.toLowerCase()) ||
              selectedSizes.includes(v.sizeId.toLowerCase());
            if (!matchesSize) return false;
          }

          // 2. Color match
          if (selectedColors.length > 0) {
            const matchesColor =
              selectedColors.includes(v.colorName.toLowerCase()) ||
              selectedColors.includes(v.colorHex.toLowerCase()) ||
              selectedColors.includes(v.colorId.toLowerCase());
            if (!matchesColor) return false;
          }

          // 3. Price range match (evaluated against the individual variant's actual price)
          if (minCents !== null && !Number.isNaN(minCents) && minCents > 0) {
            if (v.priceCents < minCents) return false;
          }
          if (maxCents !== null && !Number.isNaN(maxCents) && maxCents > 0) {
            if (v.priceCents > maxCents) return false;
          }

          return true;
        });
      });
    }

    // 6. Apply sorting
    // PRICING SORT RULE:
    // Sorts the entire filtered collection consistently by the product's baseline starting price (minPriceCents).
    const sort = searchParams.sort || 'newest';
    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.minPriceCents - b.minPriceCents);
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.minPriceCents - a.minPriceCents);
    } else {
      // default: newest arrivals
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // 7. Determine active category metadata
    let activeCategory: CatalogData['activeCategory'] = null;
    if (searchParams.category && searchParams.category !== 'all') {
      const found = categories.find(
        (c) =>
          c.slug.toLowerCase() === searchParams.category?.toLowerCase() ||
          c.id === searchParams.category
      );
      if (found) {
        activeCategory = {
          id: found.id,
          slug: found.slug,
          name: isArabic ? found.name_ar : found.name_en
        };
      }
    }

    return {
      status: 'ready',
      products: filtered,
      totalCount: filtered.length,
      filterOptions,
      activeCategory
    };
  } catch {
    return {
      status: 'unavailable',
      products: [],
      totalCount: 0,
      filterOptions: {
        categories: [],
        sizes: [],
        colors: [],
        minPriceCents: 0,
        maxPriceCents: 0
      },
      activeCategory: null
    };
  }
}
