-- =============================================================================
-- Migration: 20261008000002_storage.sql
-- Description: Provision product-images storage bucket with public delivery
--              and admin-only upload/modify/delete access control.
-- Max File Size: 5MB
-- Allowed MIME Types: image/jpeg, image/png, image/webp, image/avif
-- =============================================================================

-- Ensure product-images storage bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- Storage Object Policies for product-images bucket

-- 1. Public Read: Anyone can view and download product images
CREATE POLICY "Public read product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- 2. Admin Insert: Only verified administrators can upload images
CREATE POLICY "Admins can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
  );

-- 3. Admin Update: Only verified administrators can overwrite or update images
CREATE POLICY "Admins can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
  );

-- 4. Admin Delete: Only verified administrators can delete images
CREATE POLICY "Admins can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.is_admin()
  );
