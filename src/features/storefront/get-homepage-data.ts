import {createClient} from '@/lib/supabase/server';
import type {Category, CouplesBundle, Product} from '@/types/database';

export type HomeProduct = Pick<Product, 'id' | 'title_en' | 'title_ar'> & {
  imageUrl: string | null;
};

export type HomeBundle = Pick<CouplesBundle, 'id' | 'title_en' | 'title_ar'> & {
  imageUrl: string | null;
};

export type HomepageData = {
  status: 'ready' | 'unconfigured' | 'unavailable';
  categories: Pick<Category, 'id' | 'name_en' | 'name_ar'>[];
  products: HomeProduct[];
  bundles: HomeBundle[];
};

const emptyData = (status: HomepageData['status']): HomepageData => ({
  status,
  categories: [],
  products: [],
  bundles: []
});

export async function getHomepageData(): Promise<HomepageData> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ) {
    return emptyData('unconfigured');
  }

  try {
    const supabase = await createClient();
    const [categoriesResult, productsResult, bundlesResult] = await Promise.all([
      supabase.from('categories').select('id,name_en,name_ar').eq('is_active', true).order('sort_order').limit(6),
      supabase.from('products').select('id,title_en,title_ar').eq('status', 'published').order('created_at', {ascending: false}).limit(4),
      supabase.from('couples_bundles').select('id,title_en,title_ar,cover_image_path').eq('is_active', true).order('created_at', {ascending: false}).limit(2)
    ]);

    if (categoriesResult.error || productsResult.error || bundlesResult.error) {
      return emptyData('unavailable');
    }

    const products = (productsResult.data ?? []) as Pick<Product, 'id' | 'title_en' | 'title_ar'>[];
    const imagesResult = products.length
      ? await supabase
          .from('product_images')
          .select('product_id,storage_path,is_cover,sort_order')
          .in('product_id', products.map(({id}) => id))
          .order('is_cover', {ascending: false})
          .order('sort_order')
      : null;

    if (imagesResult?.error) return emptyData('unavailable');

    const firstImageByProduct = new Map<string, string>();
    const images = (imagesResult?.data ?? []) as {
      product_id: string;
      storage_path: string;
    }[];
    for (const image of images) {
      if (!firstImageByProduct.has(image.product_id)) {
        firstImageByProduct.set(image.product_id, image.storage_path);
      }
    }

    const publicImageUrl = (path: string | null | undefined) =>
      path ? supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl : null;

    return {
      status: 'ready',
      categories: (categoriesResult.data ?? []) as Pick<Category, 'id' | 'name_en' | 'name_ar'>[],
      products: products.map((product) => ({
        ...product,
        imageUrl: publicImageUrl(firstImageByProduct.get(product.id))
      })),
      bundles: ((bundlesResult.data ?? []) as Pick<CouplesBundle, 'id' | 'title_en' | 'title_ar' | 'cover_image_path'>[]).map(({cover_image_path, ...bundle}) => ({
        ...bundle,
        imageUrl: publicImageUrl(cover_image_path)
      }))
    };
  } catch {
    return emptyData('unavailable');
  }
}
