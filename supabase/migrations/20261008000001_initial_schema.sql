-- =============================================================================
-- Migration: 20261008000001_initial_schema.sql
-- Description: Core e-commerce schema, couples clothing domain, RLS policies,
--              and admin authorization functions.
-- Currency Convention: All monetary values stored as integer minor units (cents/piastres).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Generic updated_at trigger function
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. admin_users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_users IS 'Explicit administrator membership. Can only be populated through trusted administrative processes.';

-- Admin authorization verification helper (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Verifies whether the current authenticated user has an active record in admin_users.';

-- -----------------------------------------------------------------------------
-- 2. categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (length(trim(slug)) > 0),
  name_en text NOT NULL CHECK (length(trim(name_en)) > 0),
  name_ar text NOT NULL CHECK (length(trim(name_ar)) > 0),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active_sort ON public.categories (is_active, sort_order);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 3. sizes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE CHECK (length(trim(label)) > 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sizes_sort_order ON public.sizes (sort_order);

-- -----------------------------------------------------------------------------
-- 4. colors
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL CHECK (length(trim(name_en)) > 0),
  name_ar text NOT NULL CHECK (length(trim(name_ar)) > 0),
  hex_code text NOT NULL CHECK (hex_code ~* '^#[0-9a-f]{6}$'),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_colors_sort_order ON public.colors (sort_order);

-- -----------------------------------------------------------------------------
-- 5. products
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE CHECK (length(trim(slug)) > 0),
  title_en text NOT NULL CHECK (length(trim(title_en)) > 0),
  title_ar text NOT NULL CHECK (length(trim(title_ar)) > 0),
  description_en text,
  description_ar text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 6. product_variants
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_id uuid NOT NULL REFERENCES public.sizes(id) ON DELETE RESTRICT,
  color_id uuid NOT NULL REFERENCES public.colors(id) ON DELETE RESTRICT,
  sku text NOT NULL UNIQUE CHECK (length(trim(sku)) > 0),
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  compare_at_price_cents integer CHECK (compare_at_price_cents IS NULL OR compare_at_price_cents >= 0),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_product_variants_product_size_color UNIQUE (product_id, size_id, color_id)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants (product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants (sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON public.product_variants (is_active);

CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 7. product_images
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  storage_path text NOT NULL CHECK (length(trim(storage_path)) > 0),
  sort_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images (product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_variant_id ON public.product_images (variant_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON public.product_images (sort_order);

-- Function and trigger to ensure variant-linked images belong to the same parent product
CREATE OR REPLACE FUNCTION public.check_product_image_variant_match()
RETURNS trigger AS $$
BEGIN
  IF NEW.variant_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.product_variants pv
      WHERE pv.id = NEW.variant_id AND pv.product_id = NEW.product_id
    ) THEN
      RAISE EXCEPTION 'variant_id % does not belong to product_id %', NEW.variant_id, NEW.product_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_product_image_variant_match
  BEFORE INSERT OR UPDATE ON public.product_images
  FOR EACH ROW
  EXECUTE FUNCTION public.check_product_image_variant_match();

-- -----------------------------------------------------------------------------
-- 8. couples_bundles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.couples_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (length(trim(slug)) > 0),
  title_en text NOT NULL CHECK (length(trim(title_en)) > 0),
  title_ar text NOT NULL CHECK (length(trim(title_ar)) > 0),
  description_en text,
  description_ar text,
  first_product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  second_product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  bundle_price_cents integer NOT NULL CHECK (bundle_price_cents >= 0),
  cover_image_path text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_couples_bundles_distinct_products CHECK (first_product_id <> second_product_id)
);

COMMENT ON TABLE public.couples_bundles IS 'Pairs two distinct products into a bundle. Inventory is derived dynamically from individual product variants; bundles never duplicate stock.';

CREATE INDEX IF NOT EXISTS idx_couples_bundles_slug ON public.couples_bundles (slug);
CREATE INDEX IF NOT EXISTS idx_couples_bundles_active ON public.couples_bundles (is_active);
CREATE INDEX IF NOT EXISTS idx_couples_bundles_first_product ON public.couples_bundles (first_product_id);
CREATE INDEX IF NOT EXISTS idx_couples_bundles_second_product ON public.couples_bundles (second_product_id);

CREATE TRIGGER trg_couples_bundles_updated_at
  BEFORE UPDATE ON public.couples_bundles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 9. store_settings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  whatsapp_number text NOT NULL CHECK (length(trim(whatsapp_number)) > 0),
  currency_code text NOT NULL DEFAULT 'EGP' CHECK (length(trim(currency_code)) = 3),
  delivery_note_en text,
  delivery_note_ar text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.store_settings IS 'Single-row configuration for WhatsApp checkout contact details, default currency, and localized delivery notes.';

-- Seed default single-row store configuration
INSERT INTO public.store_settings (id, whatsapp_number, currency_code, delivery_note_en, delivery_note_ar)
VALUES (
  1,
  '+201000000000',
  'EGP',
  'Standard delivery within 2-4 business days across Egypt.',
  'توصيل قياسي خلال 2 إلى 4 أيام عمل لجميع أنحاء مصر.'
)
ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER trg_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- 1. admin_users RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- No INSERT/UPDATE/DELETE policies for authenticated or anon users.
-- admin_users can only be created via trusted database administrative execution.

-- 2. categories RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active categories"
  ON public.categories
  FOR SELECT
  TO public
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert categories"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete categories"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 3. sizes RLS
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view sizes"
  ON public.sizes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert sizes"
  ON public.sizes
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update sizes"
  ON public.sizes
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete sizes"
  ON public.sizes
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4. colors RLS
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view colors"
  ON public.colors
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert colors"
  ON public.colors
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update colors"
  ON public.colors
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete colors"
  ON public.colors
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 5. products RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published products"
  ON public.products
  FOR SELECT
  TO public
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 6. product_variants RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active variants of published products"
  ON public.product_variants
  FOR SELECT
  TO public
  USING (
    (
      is_active = true
      AND EXISTS (
        SELECT 1
        FROM public.products p
        WHERE p.id = product_variants.product_id
          AND p.status = 'published'
      )
    )
    OR public.is_admin()
  );

CREATE POLICY "Admins can insert variants"
  ON public.product_variants
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update variants"
  ON public.product_variants
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete variants"
  ON public.product_variants
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 7. product_images RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view images of published products"
  ON public.product_images
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_images.product_id
        AND p.status = 'published'
    )
    OR public.is_admin()
  );

CREATE POLICY "Admins can insert images"
  ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update images"
  ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete images"
  ON public.product_images
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 8. couples_bundles RLS
ALTER TABLE public.couples_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active bundles with published products"
  ON public.couples_bundles
  FOR SELECT
  TO public
  USING (
    (
      is_active = true
      AND EXISTS (
        SELECT 1
        FROM public.products p1
        WHERE p1.id = couples_bundles.first_product_id
          AND p1.status = 'published'
      )
      AND EXISTS (
        SELECT 1
        FROM public.products p2
        WHERE p2.id = couples_bundles.second_product_id
          AND p2.status = 'published'
      )
    )
    OR public.is_admin()
  );

CREATE POLICY "Admins can insert bundles"
  ON public.couples_bundles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update bundles"
  ON public.couples_bundles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete bundles"
  ON public.couples_bundles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 9. store_settings RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view store settings"
  ON public.store_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update store settings"
  ON public.store_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Deny inserts/deletes on store_settings (singleton table)
