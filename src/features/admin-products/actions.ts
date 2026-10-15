'use server';

import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getProductAdminClient } from './access';
import { imageBytesMatchType, UUID_PATTERN, validateImageFile, validateProductForm, type ValidationError } from './validation';
import type { AdminProductFormData } from './types';

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: ValidationError[];
}

export async function uploadProductImageAction(formData: FormData): Promise<ActionResponse<{ id: string; storagePath: string; publicUrl: string; sortOrder: number; isCover: boolean }>> {
  const supabase = await getProductAdminClient();
  try {
    const file = formData.get('file');
    const productId = formData.get('productId');

    if (!(file instanceof File)) {
      return { success: false, error: 'No image file provided.' };
    }
    if (typeof productId !== 'string' || !UUID_PATTERN.test(productId)) {
      return { success: false, error: 'Save the product before adding images.' };
    }

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error || 'Invalid image file.' };
    }
    const db = supabase as unknown as SupabaseClient;

    const {data: product, error: productError} = await db.from('products').select('id').eq('id', productId).maybeSingle();
    if (productError || !product) return {success: false, error: 'Product not found.'};

    const {count, error: countError} = await db.from('product_images').select('id', {count: 'exact', head: true}).eq('product_id', productId);
    if (countError) return {success: false, error: 'Could not check product images.'};

    const extension = ({'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif'} as Record<string, string>)[file.type];
    const storagePath = `products/${productId}/${randomUUID()}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (!imageBytesMatchType(buffer, file.type)) return {success: false, error: 'File content does not match an allowed image type.'};

    const { error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadErr) {
      console.error('Storage upload error:', uploadErr);
      return { success: false, error: uploadErr.message || 'Failed to upload image to storage bucket.' };
    }

    const sortOrder = count ?? 0;
    const isCover = sortOrder === 0;
    const {data: image, error: imageError} = await db.from('product_images')
      .insert({product_id: productId, storage_path: storagePath, sort_order: sortOrder, is_cover: isCover})
      .select('id').single();
    if (imageError || !image) {
      await supabase.storage.from('product-images').remove([storagePath]);
      return {success: false, error: 'Image upload could not be saved.'};
    }

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(storagePath);

    return {
      success: true,
      data: {
        id: image.id,
        storagePath,
        publicUrl: urlData.publicUrl,
        sortOrder,
        isCover
      }
    };
  } catch (err) {
    console.error('uploadProductImageAction exception:', err);
    return { success: false, error: 'An unexpected error occurred during image upload.' };
  }
}

export async function deleteProductStorageImageAction(productId: string, imageId: string): Promise<ActionResponse> {
  const supabase = await getProductAdminClient();
  try {
    if (!UUID_PATTERN.test(productId) || !UUID_PATTERN.test(imageId)) return {success: false, error: 'Invalid image request.'};
    const db = supabase as unknown as SupabaseClient;

    const {data: image, error: readError} = await db.from('product_images')
      .select('*').eq('id', imageId).eq('product_id', productId).maybeSingle();
    if (readError || !image) return {success: false, error: 'Product image not found.'};

    const {error: deleteError} = await db.from('product_images').delete().eq('id', imageId).eq('product_id', productId);
    if (deleteError) return {success: false, error: 'Could not remove image record.'};

    const {error: storageError} = await supabase.storage.from('product-images').remove([image.storage_path]);
    if (storageError) {
      const {error: restoreError} = await db.from('product_images').insert(image);
      if (restoreError) console.error('Could not restore image record after storage failure:', restoreError);
      return {success: false, error: 'Could not remove image file. Please retry.'};
    }

    if (image.is_cover) {
      const {data: nextImage} = await db.from('product_images').select('id')
        .eq('product_id', productId).order('sort_order', {ascending: true}).limit(1).maybeSingle();
      if (nextImage) await db.from('product_images').update({is_cover: true}).eq('id', nextImage.id);
    }

    revalidatePath('/[locale]/admin/products', 'page');

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete image.' };
  }
}

export async function createProductAction(data: AdminProductFormData): Promise<ActionResponse<{ productId: string }>> {
  const supabase = await getProductAdminClient();
  try {
    const validation = validateProductForm(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Please fix validation errors before creating the product.',
        validationErrors: validation.errors
      };
    }
    if (data.images.length > 0) return {success: false, error: 'Save the product before adding images.'};

    const db = supabase as unknown as SupabaseClient;

    // 1. Check slug uniqueness
    const { data: existingSlugProduct, error: slugError } = await supabase
      .from('products')
      .select('id')
      .eq('slug', data.slug.trim().toLowerCase())
      .maybeSingle();
    if (slugError) return {success: false, error: 'Could not verify product slug.'};

    if (existingSlugProduct) {
      return {
        success: false,
        error: `A product with slug "${data.slug}" already exists. Please choose a unique slug.`,
        validationErrors: [{ field: 'slug', message: 'Slug is already in use.' }]
      };
    }

    // 2. Check SKUs uniqueness against existing product_variants
    const skus = data.variants.map((v) => v.sku.trim().toUpperCase());
    if (skus.length > 0) {
      const { data: existingSkus, error: skuError } = await db.from('product_variants')
        .select('sku')
        .in('sku', skus);
      if (skuError) return {success: false, error: 'Could not verify variant SKUs.'};

      if (existingSkus && existingSkus.length > 0) {
        const dupSku = (existingSkus[0] as { sku: string }).sku;
        return {
          success: false,
          error: `SKU "${dupSku}" is already assigned to another variant in the store. SKUs must be unique.`
        };
      }
    }

    // 3. Insert Product
    const { data: createdProduct, error: prodErr } = await db.from('products')
      .insert({
        title_en: data.titleEn.trim(),
        title_ar: data.titleAr.trim(),
        slug: data.slug.trim().toLowerCase(),
        description_en: data.descriptionEn?.trim() || null,
        description_ar: data.descriptionAr?.trim() || null,
        category_id: data.categoryId || null,
        status: data.status
      })
      .select('id')
      .single();

    if (prodErr || !createdProduct) {
      console.error('Error inserting product:', prodErr);
      return {
        success: false,
        error: prodErr?.message || 'Failed to create product in database.'
      };
    }

    const productId = (createdProduct as { id: string }).id;

    // 4. Insert Variants
    if (data.variants && data.variants.length > 0) {
      const variantInserts = data.variants.map((v) => ({
        product_id: productId,
        size_id: v.sizeId,
        color_id: v.colorId,
        sku: v.sku.trim().toUpperCase(),
        price_cents: Math.round(v.priceEGP * 100),
        compare_at_price_cents: v.compareAtPriceEGP ? Math.round(v.compareAtPriceEGP * 100) : null,
        stock_quantity: v.stockQuantity,
        is_active: v.isActive
      }));

      const { error: variantsErr } = await db.from('product_variants').insert(variantInserts);
      if (variantsErr) {
        console.error('Error inserting product variants:', variantsErr);
        const {error: rollbackError} = await db.from('products').delete().eq('id', productId);
        if (rollbackError) console.error('Failed to remove incomplete product:', rollbackError);
        return {
          success: false,
          error: rollbackError ? 'Product was created but variants failed. Please review it in the product list.' : 'Could not save product variants. No product was kept.'
        };
      }
    }

    revalidatePath('/[locale]/admin/products', 'page');
    revalidatePath('/[locale]/products', 'page');

    return { success: true, data: { productId } };
  } catch (err) {
    console.error('createProductAction exception:', err);
    return { success: false, error: 'An unexpected server error occurred while creating the product.' };
  }
}

export async function updateProductAction(productId: string, data: AdminProductFormData): Promise<ActionResponse> {
  const supabase = await getProductAdminClient();
  try {
    if (!UUID_PATTERN.test(productId)) return {success: false, error: 'Invalid product.'};
    const validation = validateProductForm(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Please fix validation errors before saving.',
        validationErrors: validation.errors
      };
    }

    const db = supabase as unknown as SupabaseClient;

    // 1. Check slug uniqueness (excluding this product)
    const { data: existingSlugProduct, error: slugError } = await supabase
      .from('products')
      .select('id')
      .eq('slug', data.slug.trim().toLowerCase())
      .neq('id', productId)
      .maybeSingle();
    if (slugError) return {success: false, error: 'Could not verify product slug.'};

    if (existingSlugProduct) {
      return {
        success: false,
        error: `A product with slug "${data.slug}" already exists. Please choose a unique slug.`,
        validationErrors: [{ field: 'slug', message: 'Slug is already in use.' }]
      };
    }

    // 2. Check SKU uniqueness against variants belonging to OTHER products
    const skus = data.variants.map((v) => v.sku.trim().toUpperCase());
    if (skus.length > 0) {
      const { data: otherSkus, error: skuError } = await db.from('product_variants')
        .select('sku, product_id')
        .in('sku', skus)
        .neq('product_id', productId);
      if (skuError) return {success: false, error: 'Could not verify variant SKUs.'};

      if (otherSkus && otherSkus.length > 0) {
        const dupSku = (otherSkus[0] as { sku: string }).sku;
        return {
          success: false,
          error: `SKU "${dupSku}" is already used by another product. Each variant SKU must be unique.`
        };
      }
    }

    const [{data: existingProduct, error: existingError}, {data: currentVariantsRaw, error: currentVariantsError}, {data: currentImagesRaw, error: currentImagesError}] = await Promise.all([
      db.from('products').select('id').eq('id', productId).maybeSingle(),
      db.from('product_variants').select('id').eq('product_id', productId),
      db.from('product_images').select('id, storage_path').eq('product_id', productId)
    ]);
    if (existingError || !existingProduct || currentVariantsError || currentImagesError) {
      return {success: false, error: 'Product data could not be verified.'};
    }
    const currentVariantIds = new Set(((currentVariantsRaw ?? []) as Array<{id: string}>).map((v) => v.id));
    if (data.variants.some((v) => v.id && !currentVariantIds.has(v.id))) {
      return {success: false, error: 'A variant does not belong to this product.'};
    }
    const currentImgMap = new Map(((currentImagesRaw ?? []) as Array<{id: string; storage_path: string}>).map((img) => [img.id, img.storage_path]));
    if (data.images.some((img) => !img.id || currentImgMap.get(img.id) !== img.storagePath)) {
      return {success: false, error: 'An image does not belong to this product.'};
    }

    // 3. Update Product row
    const { error: prodErr } = await db.from('products')
      .update({
        title_en: data.titleEn.trim(),
        title_ar: data.titleAr.trim(),
        slug: data.slug.trim().toLowerCase(),
        description_en: data.descriptionEn?.trim() || null,
        description_ar: data.descriptionAr?.trim() || null,
        category_id: data.categoryId || null,
        status: data.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (prodErr) {
      console.error('Error updating product:', prodErr);
      return { success: false, error: prodErr.message || 'Failed to update product details.' };
    }

    // 4. Synchronize Variants
    const submittedVariantIds = new Set(data.variants.map((v) => v.id).filter(Boolean) as string[]);

    // Delete variants removed by the admin
    const variantIdsToDelete = [...currentVariantIds].filter((id) => !submittedVariantIds.has(id));
    if (variantIdsToDelete.length > 0) {
      const { error: delVarErr } = await supabase
        .from('product_variants')
        .delete()
        .in('id', variantIdsToDelete);

      if (delVarErr) {
        console.error('Error deleting removed variants:', delVarErr);
        return {success: false, error: 'Could not remove a variant. Review the product before retrying.'};
      }
    }

    // Update existing or insert new variants
    for (const v of data.variants) {
      const variantPayload = {
        product_id: productId,
        size_id: v.sizeId,
        color_id: v.colorId,
        sku: v.sku.trim().toUpperCase(),
        price_cents: Math.round(v.priceEGP * 100),
        compare_at_price_cents: v.compareAtPriceEGP ? Math.round(v.compareAtPriceEGP * 100) : null,
        stock_quantity: v.stockQuantity,
        is_active: v.isActive,
        updated_at: new Date().toISOString()
      };

      if (v.id && currentVariantIds.has(v.id)) {
        const {error} = await db.from('product_variants').update(variantPayload).eq('id', v.id).eq('product_id', productId);
        if (error) return {success: false, error: 'Could not update a variant. Review the product before retrying.'};
      } else {
        const {error} = await db.from('product_variants').insert({
          ...variantPayload,
          created_at: new Date().toISOString()
        });
        if (error) return {success: false, error: 'Could not add a variant. Review the product before retrying.'};
      }
    }

    // 5. Persist cover and ordering. Upload/removal actions own image rows and Storage.
    for (let index = 0; index < data.images.length; index++) {
      const img = data.images[index];
      const {error} = await db.from('product_images')
        .update({sort_order: index, is_cover: img.isCover})
        .eq('id', img.id!).eq('product_id', productId);
      if (error) return {success: false, error: 'Could not save image ordering. Review the product before retrying.'};
    }

    revalidatePath('/[locale]/admin/products', 'page');
    revalidatePath(`/[locale]/admin/products/${productId}/edit`, 'page');
    revalidatePath('/[locale]/products', 'page');
    revalidatePath(`/[locale]/products/${data.slug}`, 'page');

    return { success: true };
  } catch (err) {
    console.error('updateProductAction exception:', err);
    return { success: false, error: 'An unexpected server error occurred while updating the product.' };
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResponse> {
  const supabase = await getProductAdminClient();
  try {
    if (!UUID_PATTERN.test(productId)) return {success: false, error: 'Invalid product.'};
    const db = supabase as unknown as SupabaseClient;

    // 1. Check if product is referenced in couples_bundles
    const { data: bundles, error: bundlesError } = await supabase
      .from('couples_bundles')
      .select('id, slug, title_en')
      .or(`first_product_id.eq.${productId},second_product_id.eq.${productId}`);
    if (bundlesError) return {success: false, error: 'Could not verify bundle references.'};

    if (bundles && bundles.length > 0) {
      const bundleTitles = ((bundles ?? []) as Array<{ title_en: string }>).map((b) => b.title_en).join(', ');
      return {
        success: false,
        error: `Cannot delete product: it is currently part of couples bundle(s): "${bundleTitles}". Please update or delete the bundle first.`
      };
    }

    // Require images to be removed through the paired database/Storage action first.
    const {data: images, error: imagesError} = await db.from('product_images').select('id').eq('product_id', productId);
    if (imagesError) return {success: false, error: 'Could not verify product images.'};
    if (images && images.length > 0) return {success: false, error: 'Remove product images before deleting this product.'};

    // Variants cascade after the product row is removed.
    const { data: deletedProduct, error: delErr } = await db.from('products').delete().eq('id', productId).select('id').maybeSingle();
    if (delErr) {
      console.error('Error deleting product:', delErr);
      return { success: false, error: delErr.message || 'Failed to delete product from database.' };
    }
    if (!deletedProduct) return {success: false, error: 'Product not found.'};

    revalidatePath('/[locale]/admin/products', 'page');
    revalidatePath('/[locale]/products', 'page');

    return { success: true };
  } catch (err) {
    console.error('deleteProductAction exception:', err);
    return { success: false, error: 'An unexpected server error occurred while deleting the product.' };
  }
}
